describe("rollup calculations", function() {
    it("should have written tests",function(){
        _calculateRollups(feature, iterations);
        expect(feature).toBe(cumulative_total_feature);
    });
    
});

