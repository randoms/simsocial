define(['underscore'], function(_){
    function sum(marray){
        var msum = 0;
        _(marray).each(function(item){
            msum += item;
        })
        return msum;
    }

    function average(marray){
        return sum(marray)/marray.length;
    }

    return {
        'sum': sum,
        'average': average,
    }
})