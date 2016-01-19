var vcCharts = (function() {
    var formatNumber = d3.format(".0f"),
        formatTrillion = function(x) { return '$' + formatNumber(x / 1e12) + "T"; },
        formatBillion = function(x) { return '$' + formatNumber(x / 1e9) + "B"; },
        formatMillion = function(x) { return '$' + formatNumber(x / 1e6) + "M"; };
        formatThousand = function(x) { return '$' + formatNumber(x / 1e3) + "k"; };

    function formatAbbreviation(x) {
        var v = Math.abs(x);
        return (v >= .9995e12 ? formatTrillion
                : v >= .9995e9 ? formatBillion
                : v >= .9995e6 ? formatMillion
                : formatThousand)(x);
    }

    var baseChart = {
        init: function(chartID, config) {
            this.margin = {
                top: (config.margin && config.margin.top)       || 10,
                right: (config.margin && config.margin.right)   || 36,
                bottom: (config.margin && config.margin.bottom) || 80,
                left: (config.margin && config.margin.left)     || 72
            };
            this.gridlines = (config.gridlines === true)        || false;
            this.outerChart = d3.select('#' + chartID);
            this.x = d3.scale.log();
            this.y = d3.scale.log();
            this.setSizeAndScales();
            this.xAxis = d3.svg.axis()
                .scale(this.x)
                .orient('bottom')
                .ticks(10,formatAbbreviation);

            this.yAxis = d3.svg.axis()
                .scale(this.y)
                .orient('left')
                .ticks(5,formatAbbreviation);

            this.yGrid = d3.svg.axis()
                .scale(this.y)
                .orient('left')
                .ticks(5,function() {return '';});

            this.chart = this.outerChart
                .append('g')
                .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

            this.gXAxis = this.chart.append('g')
                .attr('class', 'x axis')
                .attr('transform', 'translate(0,' + this.height + ')');

            this.gYAxis = this.chart.append('g')
                .attr('class', 'y axis');

            if (this.gridlines) {
                this.gYTicks = this.chart.append('g')
                    .attr('class', 'grid');
            }
            d3.select(window).on('resize.' + chartID, this.resize.bind(this));
        },
        setSizeAndScales: function() {
            this.width = parseInt(this.outerChart.style('width'), 10) - this.margin.left - this.margin.right;
            this.height = parseInt(this.outerChart.style('height'), 10) - this.margin.top - this.margin.bottom;

            this.x.range([0, this.width]);
            this.y.range([this.height, 0]);
        },
        resize: function() {
            this.setSizeAndScales();
            this.gXAxis
                .call(this.xAxis)
                .selectAll('text')
                .style('text-anchor', 'end')
                .attr('dx', '-1em')
                .attr('dy', '-0.6em')
                .attr('transform', function(d) {return 'rotate(-90)'});

            this.gYAxis.call(this.yAxis);
            if (this.gridlines) {
                this.yGrid.tickSize(-this.width, 0, 0);
                this.gYTicks.call(this.yGrid);
            }
            this.customResize();
        },
        draw: function(data) {
            this.x.domain(d3.extent(data, this.customXDomain));
            this.y.domain([d3.min(data, this.customYMin),d3.max(data, this.customYMax)]);
            this.customDraw(data);
            this.resize();
        }
    };
    function waterfallPlot(chartID) {
        var chart = Object.create(baseChart);
        chart.line = d3.svg.line()
            .x(function(d) {return chart.x(1 + d.totalProceeds);})
            .y(function(d) {return chart.y(1 + d.individualProceeds);});
        chart.customResize = function() {
            this.x.range([0,0.1*this.width,0.75*this.width,this.width]);
            this.y.range([this.height,0.9*this.height,0.25*this.height,0]);
            this.chart.selectAll('.line').attr('d', chart.line);
            this.gXAxis.call(this.xAxis);
            this.gYAxis.call(this.yAxis);
            if (this.gridlines) {
                this.yGrid.tickSize(-this.width, 0, 0);
                this.gYTicks.call(this.yGrid);
            }
        }
        chart.customDraw = function(proceeds) {
            var xMax = d3.max(proceeds, this.customXDomain);
            var yMax = d3.max(proceeds, this.customYMax);
            this.x.domain([1,1e6,1e8,xMax]);
            this.y.domain([1,1e6,1e8,yMax]);
            this.chart.selectAll('.line').remove();
            this.chart.append('path')
                .datum(proceeds.map(function(d) {
                    return {totalProceeds: d.totalProceeds, individualProceeds: d.commonProceeds};
                }))
                .attr('class', 'line');
            proceeds[0].preferredProceeds.forEach(function(a,i,c) {
                this.chart.append('path')
                    .datum(proceeds.map(function(d) {
                        return {totalProceeds: d.totalProceeds, individualProceeds: d.preferredProceeds[i].proceeds};
                    }))
                    .attr('class', 'line');
            }, this);
        }
        chart.customXDomain = function(d) {return 1 + d.totalProceeds};
        chart.customYMin = function(d) {return 1 + Math.min(1+d.commonProceeds, d3.min(d.preferredProceeds, function(p) {return p.proceeds}));};
        chart.customYMax = function(d) {return 1 + Math.max(1+d.commonProceeds, d3.max(d.preferredProceeds, function(p) {return p.proceeds}));};
        chart.init(chartID, {gridlines: true});
        return chart;
    }
    return {
        waterfallPlot: waterfallPlot
    };
})();
