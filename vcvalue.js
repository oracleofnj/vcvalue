var theApp = (function() {
    var addFinancing = function(e) {
        var invAmt = parseInt($('#investment-amount').val(),10);
        var valuation = parseInt($('#valuation').val(),10);
        var preMoney = ($('#financing-form input[name=pre-or-post]:checked').val() === 'pre');
        var pariPassu = ($('#financing-form input[name=pre-or-post]:checked').val() === 'pari-passu');
        var postMoneyValue = valuation + (preMoney ? invAmt : 0);
        var shareCount = 1000000 * invAmt / postMoneyValue;
        var pt = $('#PreferredTemplate').clone()
            .attr('id', 'Series A')
            .addClass('preferred-financing-round')
            .removeClass('hidden');
        pt.children('.preferred-share-count').html(shareCount);
        pt.children('.preferred-pref-per-share').html((invAmt / shareCount).toFixed(4));
        pt.appendTo('#cap-table tbody');
        e.preventDefault();
    };
    return {
        addFinancing: addFinancing
    };
})();

$(document).ready(function(){
    $('#financing-form').submit(theApp.addFinancing);

});
