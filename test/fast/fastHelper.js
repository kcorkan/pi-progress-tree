var useObjectID = function(value,record) {
    if ( record.get('ObjectID') ) {
        return record.get('ObjectID');
    } 
    return 0;
};

var _calculateRollups = function(object_tree){
    console.log('_calculateRollups');
    var estimated_rollup = 0;
    Ext.Array.each(object_tree['children'], function(child){
        _calculateRollups(child);
        for (var i=0; i<iterations.length; i++){
            estimated_rollup = estimated_rollup + child['_RollupEstimated_' + iterations[i][1]]; 
            completed_rollup = completed_rollup + child['_RollupCompleted_' + iterations[i][1]];
            child['_RollupCompleted_' + iterations[i][1]] = completed_rollup; 
        }
        for (var i=0; i<iterations.length; i++){
            child['_RollupEstimated_' + iterations[i][1]] = estimated_rollup; 
        }

    });           

    Ext.Array.each(object_tree['children'], function(child){
    });
};

var iterations = [[123,'I123'],[124,'I124'],[125,'I125'],[126,'I126']];

var feature = {
        Name: 'Feature A',
        FormattedID: 'F1',
        ObjectID: 1023,
        __Type: 'PortfolioItem/Feature',
        _display: true,
        _in_release: true,
        leaf: false,
        "Iteration I123": "Iteration I123",
        "Iteration I124": "Iteration I124",
        "Iteration I125": "Iteration I125",
        "Iteration I126": "Iteration I126",
        "_RollupCompleted_Iteration I123": 0,
        "_RollupCompleted_Iteration I124": 0,
        "_RollupCompleted_Iteration I125": 0,
        "_RollupCompleted_Iteration I126": 0,
        "_RollupEstimated_Iteration I123": 0,
        "_RollupEstimated_Iteration I124": 0,
        "_RollupEstimated_Iteration I125": 0,
        "_RollupEstimated_Iteration I126": 0,
        children: [{
                       Name: 'Epic A1',
                       FormattedID: 'US1',
                       ObjectID: 923,
                       __Type: 'HierarchicalRequirement',
                       _display: true,
                       _in_release: true,
                       leaf: false,
                       "Iteration I123": "Iteration I123",
                       "Iteration I124": "Iteration I124",
                       "Iteration I125": "Iteration I125",
                       "Iteration I126": "Iteration I126",
                       "_RollupCompleted_Iteration I123": 0,
                       "_RollupCompleted_Iteration I124": 0,
                       "_RollupCompleted_Iteration I125": 0,
                       "_RollupCompleted_Iteration I126": 0,
                       "_RollupEstimated_Iteration I123": 0,
                       "_RollupEstimated_Iteration I124": 0,
                       "_RollupEstimated_Iteration I125": 0,
                       "_RollupEstimated_Iteration I126": 0,
                       children: [{
                           Name: 'US A1-1',
                           FormattedID: 'US5',
                           ObjectID: 831,
                           __Type: 'HierarchicalRequirement',
                           _display: false,
                           _in_release: false,
                           leaf: true,
                           "Iteration I123": "Iteration I123",
                           "Iteration I124": "Iteration I124",
                           "Iteration I125": "Iteration I125",
                           "Iteration I126": "Iteration I126",
                           "_RollupCompleted_Iteration I123": 0,
                           "_RollupCompleted_Iteration I124": 0,
                           "_RollupCompleted_Iteration I125": 0,
                           "_RollupCompleted_Iteration I126": 0,
                           "_RollupEstimated_Iteration I123": 0,
                           "_RollupEstimated_Iteration I124": 0,
                           "_RollupEstimated_Iteration I125":0,
                           "_RollupEstimated_Iteration I126": 4,
                           
                       },{
                           Name: 'US A1-2',
                           FormattedID: 'US9',
                           ObjectID: 830,
                           __Type: 'HierarchicalRequirement',
                           _display: false,
                           _in_release: false,
                           leaf: true,
                           "Iteration I123": "Iteration I123",
                           "Iteration I124": "Iteration I124",
                           "Iteration I125": "Iteration I125",
                           "Iteration I126": "Iteration I126",
                           "_RollupCompleted_Iteration I123": 0,
                           "_RollupCompleted_Iteration I124": 0,
                           "_RollupCompleted_Iteration I125": 6,
                           "_RollupCompleted_Iteration I126": 0,
                           "_RollupEstimated_Iteration I123": 0,
                           "_RollupEstimated_Iteration I124": 0,
                           "_RollupEstimated_Iteration I125": 6,
                           "_RollupEstimated_Iteration I126": 0,
                           
                       }]                       
                   },
                   {
                       Name: 'Epic A2',
                       FormattedID: 'US2',
                       ObjectID: 924,
                       __Type: 'HierarchicalRequirement',
                       _display: true,
                       _in_release: true,
                       leaf: false,
                       "Iteration I123": "Iteration I123",
                       "Iteration I124": "Iteration I124",
                       "Iteration I125": "Iteration I125",
                       "Iteration I126": "Iteration I126",
                       "_RollupCompleted_Iteration I123": 0,
                       "_RollupCompleted_Iteration I124": 0,
                       "_RollupCompleted_Iteration I125": 0,
                       "_RollupCompleted_Iteration I126": 0,
                       "_RollupEstimated_Iteration I123": 0,
                       "_RollupEstimated_Iteration I124": 0,
                       "_RollupEstimated_Iteration I125": 0,
                       "_RollupEstimated_Iteration I126": 0,
                       children: [{
                           Name: 'US A2-1',
                           FormattedID: 'US3',
                           ObjectID: 824,
                           __Type: 'HierarchicalRequirement',
                           _display: false,
                           _in_release: true,
                           leaf: true,
                           "Iteration I123": "Iteration I123",
                           "Iteration I124": "Iteration I124",
                           "Iteration I125": "Iteration I125",
                           "Iteration I126": "Iteration I126",
                           "_RollupCompleted_Iteration I123": 0,
                           "_RollupCompleted_Iteration I124": 0,
                           "_RollupCompleted_Iteration I125": 0,
                           "_RollupCompleted_Iteration I126": 0,
                           "_RollupEstimated_Iteration I123": 0,
                           "_RollupEstimated_Iteration I124": 2,
                           "_RollupEstimated_Iteration I125": 0,
                           "_RollupEstimated_Iteration I126": 0,
                           
                       },{
                           Name: 'US A2-2',
                           FormattedID: 'US4',
                           ObjectID: 825,
                           __Type: 'HierarchicalRequirement',
                           _display: false,
                           _in_release: true,
                           leaf: true,
                           "Iteration I123": "Iteration I123",
                           "Iteration I124": "Iteration I124",
                           "Iteration I125": "Iteration I125",
                           "Iteration I126": "Iteration I126",
                           "_RollupCompleted_Iteration I123": 3,
                           "_RollupCompleted_Iteration I124": 0,
                           "_RollupCompleted_Iteration I125": 0,
                           "_RollupCompleted_Iteration I126": 0,
                           "_RollupEstimated_Iteration I123": 3,
                           "_RollupEstimated_Iteration I124": 0,
                           "_RollupEstimated_Iteration I125": 0,
                           "_RollupEstimated_Iteration I126": 0,
                           
                       },{
                           Name: 'US A2-3',
                           FormattedID: 'US4',
                           ObjectID: 826,
                           __Type: 'HierarchicalRequirement',
                           _display: false,
                           _in_release: false,
                           leaf: false,
                           "Iteration I123": "Iteration I123",
                           "Iteration I124": "Iteration I124",
                           "Iteration I125": "Iteration I125",
                           "Iteration I126": "Iteration I126",
                           "_RollupCompleted_Iteration I123": 0,
                           "_RollupCompleted_Iteration I124": 0,
                           "_RollupCompleted_Iteration I125": 0,
                           "_RollupCompleted_Iteration I126": 0,
                           "_RollupEstimated_Iteration I123": 0,
                           "_RollupEstimated_Iteration I124": 0,
                           "_RollupEstimated_Iteration I125": 0,
                           "_RollupEstimated_Iteration I126": 0,
                            children: [{
                                Name: 'US A2-3a',
                                FormattedID: 'US4',
                                ObjectID: 828,
                                __Type: 'HierarchicalRequirement',
                                _display: false,
                                _in_release: false,
                                leaf: true,
                                "Iteration I123": "Iteration I123",
                                "Iteration I124": "Iteration I124",
                                "Iteration I125": "Iteration I125",
                                "Iteration I126": "Iteration I126",
                                "_RollupCompleted_Iteration I123": 0,
                                "_RollupCompleted_Iteration I124": 0,
                                "_RollupCompleted_Iteration I125": 3,
                                "_RollupCompleted_Iteration I126": 0,
                                "_RollupEstimated_Iteration I123": 0,
                                "_RollupEstimated_Iteration I124": 0,
                                "_RollupEstimated_Iteration I125": 3,
                                "_RollupEstimated_Iteration I126": 0,
                                
                            },{
                                Name: 'US A2-3b',
                                FormattedID: 'US4',
                                ObjectID: 829,
                                __Type: 'HierarchicalRequirement',
                                _display: false,
                                _in_release: false,
                                leaf: true,
                                "Iteration I123": "Iteration I123",
                                "Iteration I124": "Iteration I124",
                                "Iteration I125": "Iteration I125",
                                "Iteration I126": "Iteration I126",
                                "_RollupCompleted_Iteration I123": 0,
                                "_RollupCompleted_Iteration I124": 0,
                                "_RollupCompleted_Iteration I125": 0,
                                "_RollupCompleted_Iteration I126": 0,
                                "_RollupEstimated_Iteration I123": 0,
                                "_RollupEstimated_Iteration I124": 0,
                                "_RollupEstimated_Iteration I125": 2,
                                "_RollupEstimated_Iteration I126": 0,
                                
                            }]
                       }]
                   }
                   ]
};
//cumulative total feature means that we add all estimated up beforehand and that stays static (unless new stories are added).  The completed is cumulative per sprint.          
var cumulative_total_feature = {
        Name: 'Feature A',
        FormattedID: 'F1',
        ObjectID: 1023,
        __Type: 'PortfolioItem/Feature',
        _display: true,
        _in_release: true,
        leaf: false,
        "Iteration I123": "Iteration I123",
        "Iteration I124": "Iteration I124",
        "Iteration I125": "Iteration I125",
        "Iteration I126": "Iteration I126",
        "_RollupCompleted_Iteration I123": 3,
        "_RollupCompleted_Iteration I124": 3,
        "_RollupCompleted_Iteration I125": 12,
        "_RollupCompleted_Iteration I126": 12,
        "_RollupEstimated_Iteration I123": 20,
        "_RollupEstimated_Iteration I124": 20,
        "_RollupEstimated_Iteration I125": 20,
        "_RollupEstimated_Iteration I126": 20,
        children: [{
                       Name: 'Epic A1',
                       FormattedID: 'US1',
                       ObjectID: 923,
                       __Type: 'HierarchicalRequirement',
                       _display: true,
                       _in_release: true,
                       leaf: false,
                       "Iteration I123": "Iteration I123",
                       "Iteration I124": "Iteration I124",
                       "Iteration I125": "Iteration I125",
                       "Iteration I126": "Iteration I126",
                       "_RollupCompleted_Iteration I123": 0,
                       "_RollupCompleted_Iteration I124": 0,
                       "_RollupCompleted_Iteration I125": 6,
                       "_RollupCompleted_Iteration I126": 6,
                       "_RollupEstimated_Iteration I123": 10,
                       "_RollupEstimated_Iteration I124": 10,
                       "_RollupEstimated_Iteration I125": 10,
                       "_RollupEstimated_Iteration I126": 10,
                       children: [{
                           Name: 'US A1-1',
                           FormattedID: 'US5',
                           ObjectID: 831,
                           __Type: 'HierarchicalRequirement',
                           _display: false,
                           _in_release: false,
                           leaf: true,
                           "Iteration I123": "Iteration I123",
                           "Iteration I124": "Iteration I124",
                           "Iteration I125": "Iteration I125",
                           "Iteration I126": "Iteration I126",
                           "_RollupCompleted_Iteration I123": 0,
                           "_RollupCompleted_Iteration I124": 0,
                           "_RollupCompleted_Iteration I125": 0,
                           "_RollupCompleted_Iteration I126": 0,
                           "_RollupEstimated_Iteration I123": 0,
                           "_RollupEstimated_Iteration I124": 0,
                           "_RollupEstimated_Iteration I125":0,
                           "_RollupEstimated_Iteration I126": 4,
                           
                       },{
                           Name: 'US A1-2',
                           FormattedID: 'US9',
                           ObjectID: 830,
                           __Type: 'HierarchicalRequirement',
                           _display: false,
                           _in_release: false,
                           leaf: true,
                           "Iteration I123": "Iteration I123",
                           "Iteration I124": "Iteration I124",
                           "Iteration I125": "Iteration I125",
                           "Iteration I126": "Iteration I126",
                           "_RollupCompleted_Iteration I123": 0,
                           "_RollupCompleted_Iteration I124": 0,
                           "_RollupCompleted_Iteration I125": 6,
                           "_RollupCompleted_Iteration I126": 0,
                           "_RollupEstimated_Iteration I123": 0,
                           "_RollupEstimated_Iteration I124": 0,
                           "_RollupEstimated_Iteration I125": 6,
                           "_RollupEstimated_Iteration I126": 0,
                           
                       }]                       
                   },
                   {
                       Name: 'Epic A2',
                       FormattedID: 'US2',
                       ObjectID: 924,
                       __Type: 'HierarchicalRequirement',
                       _display: true,
                       _in_release: true,
                       leaf: false,
                       "Iteration I123": "Iteration I123",
                       "Iteration I124": "Iteration I124",
                       "Iteration I125": "Iteration I125",
                       "Iteration I126": "Iteration I126",
                       "_RollupCompleted_Iteration I123": 3,
                       "_RollupCompleted_Iteration I124": 3,
                       "_RollupCompleted_Iteration I125": 6,
                       "_RollupCompleted_Iteration I126": 6,
                       "_RollupEstimated_Iteration I123": 10,
                       "_RollupEstimated_Iteration I124": 10,
                       "_RollupEstimated_Iteration I125": 10,
                       "_RollupEstimated_Iteration I126": 10,
                       children: [{
                           Name: 'US A2-1',
                           FormattedID: 'US3',
                           ObjectID: 824,
                           __Type: 'HierarchicalRequirement',
                           _display: false,
                           _in_release: true,
                           leaf: true,
                           "Iteration I123": "Iteration I123",
                           "Iteration I124": "Iteration I124",
                           "Iteration I125": "Iteration I125",
                           "Iteration I126": "Iteration I126",
                           "_RollupCompleted_Iteration I123": 0,
                           "_RollupCompleted_Iteration I124": 0,
                           "_RollupCompleted_Iteration I125": 0,
                           "_RollupCompleted_Iteration I126": 0,
                           "_RollupEstimated_Iteration I123": 0,
                           "_RollupEstimated_Iteration I124": 2,
                           "_RollupEstimated_Iteration I125": 0,
                           "_RollupEstimated_Iteration I126": 0,
                           
                       },{
                           Name: 'US A2-2',
                           FormattedID: 'US4',
                           ObjectID: 825,
                           __Type: 'HierarchicalRequirement',
                           _display: false,
                           _in_release: true,
                           leaf: true,
                           "Iteration I123": "Iteration I123",
                           "Iteration I124": "Iteration I124",
                           "Iteration I125": "Iteration I125",
                           "Iteration I126": "Iteration I126",
                           "_RollupCompleted_Iteration I123": 3,
                           "_RollupCompleted_Iteration I124": 0,
                           "_RollupCompleted_Iteration I125": 0,
                           "_RollupCompleted_Iteration I126": 0,
                           "_RollupEstimated_Iteration I123": 3,
                           "_RollupEstimated_Iteration I124": 0,
                           "_RollupEstimated_Iteration I125": 0,
                           "_RollupEstimated_Iteration I126": 0,
                           
                       },{
                           Name: 'US A2-3',
                           FormattedID: 'US4',
                           ObjectID: 826,
                           __Type: 'HierarchicalRequirement',
                           _display: false,
                           _in_release: false,
                           leaf: false,
                           "Iteration I123": "Iteration I123",
                           "Iteration I124": "Iteration I124",
                           "Iteration I125": "Iteration I125",
                           "Iteration I126": "Iteration I126",
                           "_RollupCompleted_Iteration I123": 0,
                           "_RollupCompleted_Iteration I124": 0,
                           "_RollupCompleted_Iteration I125": 3,
                           "_RollupCompleted_Iteration I126": 3,
                           "_RollupEstimated_Iteration I123": 5,
                           "_RollupEstimated_Iteration I124": 5,
                           "_RollupEstimated_Iteration I125": 5,
                           "_RollupEstimated_Iteration I126": 5,
                            children: [{
                                Name: 'US A2-3a',
                                FormattedID: 'US4',
                                ObjectID: 828,
                                __Type: 'HierarchicalRequirement',
                                _display: false,
                                _in_release: false,
                                leaf: true,
                                "Iteration I123": "Iteration I123",
                                "Iteration I124": "Iteration I124",
                                "Iteration I125": "Iteration I125",
                                "Iteration I126": "Iteration I126",
                                "_RollupCompleted_Iteration I123": 0,
                                "_RollupCompleted_Iteration I124": 0,
                                "_RollupCompleted_Iteration I125": 3,
                                "_RollupCompleted_Iteration I126": 0,
                                "_RollupEstimated_Iteration I123": 0,
                                "_RollupEstimated_Iteration I124": 0,
                                "_RollupEstimated_Iteration I125": 3,
                                "_RollupEstimated_Iteration I126": 0,
                                
                            },{
                                Name: 'US A2-3b',
                                FormattedID: 'US4',
                                ObjectID: 829,
                                __Type: 'HierarchicalRequirement',
                                _display: false,
                                _in_release: false,
                                leaf: true,
                                "Iteration I123": "Iteration I123",
                                "Iteration I124": "Iteration I124",
                                "Iteration I125": "Iteration I125",
                                "Iteration I126": "Iteration I126",
                                "_RollupCompleted_Iteration I123": 0,
                                "_RollupCompleted_Iteration I124": 0,
                                "_RollupCompleted_Iteration I125": 0,
                                "_RollupCompleted_Iteration I126": 0,
                                "_RollupEstimated_Iteration I123": 0,
                                "_RollupEstimated_Iteration I124": 0,
                                "_RollupEstimated_Iteration I125": 2,
                                "_RollupEstimated_Iteration I126": 0,
                                
                            }]
                       }]
                   }
                   ]
};




var shiftDayBeginningToEnd = function(day) {
    return Rally.util.DateTime.add(Rally.util.DateTime.add(Rally.util.DateTime.add(day,'hour',23), 'minute',59),'second',59);
};

Ext.define('mockStory',{
    extend: 'Ext.data.Model',
    fields: [
        {name:'ObjectID', type: 'int'},
        {name:'Name',type:'string'},
        {name:'PlanEstimate',type:'int'},
        {name:'id',type:'int',convert:useObjectID},
        {name:'ScheduleState',type:'string',defaultValue:'Defined'}
    ]
});

Ext.define('mockIteration',{
    extend: 'Ext.data.Model',
    fields: [
        {name:'ObjectID', type: 'int'},
        {name:'Name',type:'string'},
        {name:'StartDate',type:'auto'},
        {name:'EndDate',type:'auto'},
        {name:'id',type:'int',convert:useObjectID}
    ]
});

Ext.define('mockCFD',{
    extend: 'Ext.data.Model',
    fields: [
        {name:'CardCount',type:'int'},
        {name:'CardEstimateTotal',type:'int'},
        {name:'CardState',type:'string'},
        {name:'CardToDoTotal',type:'int'},
        {name:'CreationDate',type:'date'},
        {name:'ObjectID',type:'int'},
        {name:'TaskEstimateTotal',type:'int'}
    ]
});