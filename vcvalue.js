var theApp = (function() {
    "use strict";
    var addFinancing = function(e) {
        "use strict";
        var newRound = {};
        var rounds = $('#cap-table').data('rounds');

        newRound.invAmt = 1e6 * parseInt($('#investment-amount').val(),10);
        newRound.valuation = 1e6 * parseInt($('#valuation').val(),10);
        newRound.preMoney = ($('#financing-form input[name=pre-or-post]:checked').val() === 'pre');
        newRound.pariPassu = ($('#financing-form input[name=liquidation-preference-type]:checked').val() === 'pari');
        newRound.postMoneyValue = newRound.valuation + (newRound.preMoney ? newRound.invAmt : 0);
        newRound.shareCount = 1000000 * newRound.invAmt / newRound.postMoneyValue;
        newRound.round = rounds.length;
        rounds.push(newRound);
        var pt = $('#PreferredTemplate').clone()
            .attr('id', 'preferred-financing-round-' + newRound.round)
            .addClass('preferred-financing-round')
            .removeClass('hidden');
        pt.children('.preferred-series').html('Series ' + String.fromCharCode('A'.charCodeAt(0)+newRound.round));
        pt.children('.preferred-share-count').html(newRound.shareCount);
        pt.children('.preferred-pref-type').html(newRound.pariPassu ? 'Pari' : 'Stacked');
        pt.children('.preferred-valuation-summary').html(newRound.invAmt / 1e6 + 'mm @ ' + newRound.valuation / 1e6 + 'mm ' + (newRound.preMoney ? 'Pre' : 'Post'));
        pt.data('shareCount',newRound.shareCount);
        pt.appendTo('#cap-table tbody');
        $('#cap-table').data('rounds', rounds);
        e.preventDefault();
    };
    var initCapTable = function() {
        "use strict";
        $('#cap-table').data('rounds',[]);
    }
    return {
        addFinancing: addFinancing,
        initCapTable: initCapTable
    };
})();

$(document).ready(function(){
    "use strict";
    theApp.initCapTable();
    $('#financing-form').submit(theApp.addFinancing);

});
