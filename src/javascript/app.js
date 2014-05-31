Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    logger: new Rally.technicalservices.Logger(),
    items: [
        {xtype:'container',itemId:'message_box',tpl:'Hello, <tpl>{_refObjectName}</tpl>'},
        {xtype:'container',itemId:'display_box'} 
        /*,
        {xtype:'tsinfolink'}
        */
    ],
    iterations: [],
    completed_state_values: ['Accepted','Completed'],
    completed_state_field: 'ScheduleState',
    estimate_field: 'PlanEstimate',
    launch: function() {
        
        this.cb_release = this.down('#display_box').add({
            xtype: 'rallyreleasecombobox',
            scope:this,
            startDateField: 'ReleaseStartDate',
            endDateField: 'ReleaseDate',
            listeners: {
                scope: this,
                change: this._updateRelease
            } 
        });
   },
   _updateRelease: function(cb, newValue, oldValue){
       this.logger.log('_updateRelease', newValue, oldValue);
       var record = cb.findRecordByValue(newValue);
       var selectedReleases = [record.getId()];
       var releaseStartDate = record.get('ReleaseStartDate');
       var releaseEndDate = record.get('ReleaseDate');
       var me = this; 

       //Load Iterations for the selected release 
       this.iterations = []; 
       this._loadIterations(releaseStartDate,releaseEndDate).then({
           scope:this,
           success: function(data){
               Ext.Array.each(data,function(rec){
                   me.iterations.push([rec.getData().ObjectID,rec.getData().Name]);
               });
           }, 
           failure: function(error){
               alert('Error loading Iterations:'  + error.toString());
           }
       });
       
       
       atDate = "current";  
       var me = this;
       //Retrieve the stories for the release and calculate the rollups
       Ext.create('Rally.data.lookback.SnapshotStore', {
           scope: this,
           listeners: {
               scope: this,
               load: function(store, data, success){
                   me._buildTreeStore(data);
               }
           },
           autoLoad: true,
           fetch: ['Name','FormattedID','ObjectID','_ItemHierarchy',me.estimate_field,me.completed_state_field,'_TypeHierarchy','Iteration','PortfolioItem'],
           hydrate: ['ScheduleState','_TypeHierarchy'],
           filters: [{
                     property: '_TypeHierarchy',
                     operator: 'in',
                     value: ['HierarchicalRequirement','PortfolioItem']
           },{  //TODO:  May need to get all releases for a selected release over multiple teams 
               property: 'Release',
               operator: 'in',
               value: selectedReleases
           },{
               property: '__At',
               value: atDate
           }]
       });      
       
   
    },
    _getTopLevelObjectIds: function(data){
        this.logger.log('_getTopLevelObjectIds');
        var topLevelObjectIDs = []; 
        
        Ext.Array.each(data, function(data_obj){
            var topObjID = data_obj.data['_ItemHierarchy'][0];
            if (!Ext.Array.contains(topLevelObjectIDs, topObjID)){
                topLevelObjectIDs.push(topObjID);
            }
        });
        return topLevelObjectIDs;
    },
    _loadDetailData: function(topLevelIDs, asOfDate){
        this.logger.log('_loadDetailData');
        var me = this;
        me.logger.log('_loadDetailData',topLevelIDs);
        var deferred = Ext.create('Deft.Deferred');
        Ext.create('Rally.data.lookback.SnapshotStore', {
            scope: this,
            listeners: {
                scope: this,
                load: function(store, data, success){
                    if (success){
                        me.logger.log(data);
                        deferred.resolve(data);
                    } else {
                        me.logger.log('_loadDetailData.failure');
                        deferred.reject('Error loading details for top level object ids');
                    }
                }
            },
            autoLoad: true,
            fetch: ['Name','FormattedID','ObjectID','_ItemHierarchy',me.estimate_field,me.completed_state_field,'Iteration','Release','DirectChildrenCount','Children','UserStories','_TypeHierarchy'],
            hydrate: [me.completed_state_field,'_TypeHierarchy'],
            filters: [{
                      property: '_ItemHierarchy',
                      operator: 'in',
                      value: topLevelIDs
            },{
                property: '__At',
                value: "current"
            }]
        });      
        return deferred.promise; 
    },
    _getRollupEstimatedField: function(index){
        return '_RollupEstimated_' + this._getIterationName(index);
    },
    _getRollupCompletedField: function(index){
        return '_RollupCompleted_' + this._getIterationName(index);
    },
    _getIterationName: function(index){
        return 'Iteration ' + this.iterations[index][1];
    },
    _getIterationIndex: function(iteration_id) {
        for (var i=0; i<this.iterations.length; i++){
            if (this.iterations[i][0] == iteration_id){
                return i;
            }
        }
        return -1;
    }, 
    _populateObject: function(id,data_hash){
        this.logger.log('_populateObject', id);
        var me = this;
        var tree_obj=[];
        var obj = data_hash[id];

        tree_obj['__Type'] = obj.get('_TypeHierarchy').slice(-1)[0];
        tree_obj['ObjectID'] = id;
        tree_obj['FormattedID'] = obj.get('FormattedID');
        tree_obj['Name']=obj.get('Name');

        //initialize the rollups
        var iteration = obj.get('Iteration') || 0;
        var iteration_index = me._getIterationIndex(iteration);
        
        for (var i=0; i< me.iterations.length; i++){
            tree_obj[me._getRollupCompletedField(i)] = 0;
            tree_obj[me._getRollupEstimatedField(i)] = 0;
            tree_obj[me._getIterationName(i).toString()] = me._getIterationName(i).toString();
            if (i == iteration_index) {
                var state = obj.get(me.completed_state_field) || "";    
                var estimate = obj.get(me.estimate_field) || 0;
                tree_obj[me._getRollupEstimatedField(i)] = estimate;
                if (Ext.Array.contains(me.completed_state_values, state)){
                    tree_obj[me._getRollupCompletedField(i)] = estimate;
                }
            }
        }

        tree_obj['_display'] = false; 
        if (obj.get('PortfolioItem') > 0 || tree_obj['__Type'].toString().match(/PortfolioItem/i)){
            tree_obj['_display'] = true;
        }
       
       var children = me._getChildren(id, data_hash);
       console.log(children);
       tree_obj['children'] = children;
       console.log(tree_obj['Name'],tree_obj['FormattedID'],obj.get('DirectChildrenCount'));
       if (obj.get('DirectChildrenCount')>0){
            tree_obj['leaf'] = false;

            console.log('after children' , tree_obj['children'], tree_obj);
            //Calculate Rollups
            
//            Ext.Array.each(tree_obj['children'], function(child){
//            var cumulative_estimate = 0;
//            var cumulative_completed = 0; 
//                for (var i=0; i<me.iterations.length; i++){
//                    var sum = tree_obj[me._getRollupEstimatedField(i)] + child[me._getRollupEstimatedField(i)];
//                    cumulative_estimate = cumulative_estimate + sum; 
//                    tree_obj[me._getRollupEstimatedField(i)] = cumulative_estimate;//sum;
//
//                    sum = tree_obj[me._getRollupCompletedField(i)] + child[me._getRollupCompletedField(i)];
//                    cumulative_completed = cumulative_completed + sum;  
//                    tree_obj[me._getRollupCompletedField(i)] = cumulative_completed; //sum;
//                    console.log(me._getIterationName(i),tree_obj['Name'], tree_obj['FormattedID'], tree_obj[me._getRollupEstimatedField(i)],tree_obj[me._getRollupCompletedField(i)],child['Name'], child[me._getRollupEstimatedField(i)],child[me._getRollupCompletedField(i)]);
//                }
//            });
        } else {
            tree_obj['leaf'] = true;
        }
        this._calculateRollups(tree_obj,'iteration');
        return tree_obj; 
    },
    _getChildren: function(parent_id,data_hash){
        this.logger.log('_getChildren',parent_id);
        var children = [];
        var me= this;
        
        var obj = data_hash[parent_id];
        if (!(obj && obj.get('DirectChildrenCount') > 0)){
            return children;
        }
        
        var child_obj_ids = [];
        if (obj.get('Children') && obj.get('Children').length > 0){
            child_obj_ids = obj.get('Children');
        } else if (obj.get('UserStories') && obj.get('UserStories').length > 0){
            child_obj_ids = obj.get('UserStories');
        }
        console.log('_getChildren', child_obj_ids);
        Ext.Array.each(child_obj_ids, function(child_id){
            var child_obj = me._populateObject(child_id,data_hash);
            children.push(child_obj);
        });
        
        return children; 
    },
    _buildTreeNodeDataStructure: function(detail_data,topLevelObjectIds){
        this.logger.log('_buildTreeNodeDataStructure',detail_data,topLevelObjectIds);
        var me = this; 
        
        var data_hash = [];
        Ext.Array.each(detail_data, function(detail){
            data_hash[detail.get('ObjectID')] = detail; 
        });
        
        var topLevelObjects = [];
        Ext.Array.each(topLevelObjectIds, function(top_id){
          topLevelObject = me._populateObject(top_id,data_hash);
          topLevelObjects.push(topLevelObject);
        });
        this.logger.log('_buildTreeNodeDataStructure',topLevelObjects);
        return topLevelObjects;
    },
    _calculateRollups: function(object_tree, calculation){
        calculation='total';
        var cumulative_completed = 0; //cumulative total for each  iteration 
        var me = this;
        
        var children = object_tree['children'];
        if (!(children && children.length > 0)) {
            return; 
        }

           // me._calculateRollups(child);
            cumulative_estimated = 0;
            total_estimated = 0;
            for(var i=0; i<me.iterations.length; i++){
                var iteration_estimated = 0;
                var iteration_completed=0;
                Ext.Array.each(children, function(child){
                    if (child.leaf == false || calculation == 'iteration'){
                        iteration_estimated = iteration_estimated + child[me._getRollupEstimatedField(i)];
                        iteration_completed = iteration_completed + child[me._getRollupCompletedField(i)];

                        object_tree[me._getRollupEstimatedField(i)] = iteration_estimated;
                        object_tree[me._getRollupCompletedField(i)] = iteration_completed;
                    } else {  // for leaf children when doing cumulative roll ups
                        cumulative_estimated = cumulative_estimated + child[me._getRollupEstimatedField(i)];
                        cumulative_completed = cumulative_completed + child[me._getRollupCompletedField(i)];
                        
                        object_tree[me._getRollupEstimatedField(i)] = cumulative_estimated;
                        object_tree[me._getRollupCompletedField(i)] = cumulative_completed;
                    }                    
                });
                if (i==me.iterations.length-1) total_estimated = total_estimated + object_tree[me._getRollupEstimatedField(i)];
            }
            console.log(object_tree['Name'],'toal_estimated',total_estimated);
         
        if (calculation == 'total'){
            for (var i=0; i< me.iterations.length; i++){
                object_tree[me._getRollupEstimatedField(i)]=total_estimated;
            }
        }

        
    },
    _defineFieldModel: function(){
        this.logger.log('_defineFieldModel');
       // extend the model to add fields
        var me = this; 
        var fields = [];
        
        fields.push({ name:'FormattedID', type: 'String' });
        fields.push({name:'Name', type:'String' });

        for (var i=0; i<me.iterations.length; i++) {
            fields.push({name: me._getIterationName(i), type:'String'});
            fields.push({name: me._getRollupEstimatedField(i), type:'Float'});
            fields.push({name: me._getRollupCompletedField(i), type:'Float'});
        }
            
        var model = {
            extend: 'Ext.data.Model',
            fields: fields
        };
        me.logger.log("Made a model using these fields: ", fields);
        return model; ;
    },
    
    _buildTreeStore: function(data){
        this.logger.log('_buildTreeStore');
        var me = this;  
        var topLevelObjects = this._getTopLevelObjectIds(data);
        console.log('_buildTreeStore',topLevelObjects,data);
        var tree_nodes = {};
        
        this._loadDetailData(topLevelObjects, new Date()).then({
            scope:this,
            success: function(data){
            
               tree_nodes = me._buildTreeNodeDataStructure(data,topLevelObjects);
               var model = me._defineFieldModel();
               Ext.define('TSTreeModelWithIterations', model);        
               
               var treeStore = Ext.create('Ext.data.TreeStore',{
                   model: TSTreeModelWithIterations,
                   root: {
                       expanded: false,
                       children: tree_nodes
                       }
               });
               console.log('before buildtree');
               me._buildTree(treeStore); 
            },
            failure: function(error){
                
            }
        });
        
    },
    
    _buildTree: function(tree_store){
        this.logger.log('_buildTree');
        var me = this;
        console.log(tree_store);

        var tree_columns = me._getTreeColumns();
        me.down('#display_box').add({
            scope:this,
            xtype:'treepanel',
            store: tree_store,
            rootVisible: false,
            autoLoad: true,
            columns: tree_columns
        });
        
    },
   _getTreeColumns: function(){
        this.logger.log('_getTreeColumns');
        var me = this;
        me.logger.log("_getColumns");
        
        var columns = [
            {
                xtype: 'treecolumn',
                text: 'FormattedID',
                dataIndex: 'FormattedID',
                itemId: 'tree_column',
                renderer: function(value,meta_data,record) {
                    return value + ": " + record.get('Name');
                },
                width: 200
            }];
        for (var i=0; i< me.iterations.length; i++){
            var column_header = me._getIterationName(i);
            var column_index = me._getIterationName(i);

            var iteration_column = {
                    dataIndex: column_index,
                    text: column_header,
                    itemId:column_index + '_column',
                    width: 100,
                    renderer: function(value,meta_data,record) {
                        console.log (record.get('Name'),record.get('_RollupEstimated_' + value),record.get('_RollupCompleted_' + value))
                        return Ext.create('Rally.technicalservices.ProgressBarTemplate',{
                                numeratorField: '_RollupCompleted_' + value,
                                denominatorField: '_RollupEstimated_' + value,
                                percentDoneName: ''
                            }).apply(record.getData());
                           
//                            if (record.get('_RollupEstimated_' + value) > 0 ){
//                            return Math.round(record.get('_RollupCompleted_' + value)/record.get('_RollupEstimated_' + value) * 100) + '%';
//                        } else {
//                            return ('N/A');
//                        }
                    },
                    menuDisabled: true
                };
                columns.push(iteration_column);
        }
        me.logger.log("Making Columns ", columns);
        return columns;        
    },
    _loadIterations: function(releaseStartDate, releaseEndDate){
        this.logger.log('_loadIterations');
        var deferred = Ext.create('Deft.Deferred');

        console.log(releaseStartDate, releaseEndDate);
        Ext.create('Rally.data.wsapi.Store',{
            model: 'Iteration',
            autoLoad: true,
            listeners: {
                scope:this,
                load: function(store, data, success){
                    if (success){
                        this.logger.log('Success loading Iterations', data);
                        deferred.resolve(data);                        
                    } else {
                        this.logger.log('Failed loading Iterations');
                        deferred.reject();
                    }
                }
            },
            fetch: ['ObjectID','Name','StartDate','EndDate'] ,
            filters: [{
                property: 'EndDate',
                operator: '>',
                value: releaseStartDate.toISOString()
            },{
                property: 'StartDate',
                operator: '<',
                value: releaseEndDate.toISOString()
            }],
            sorters: [{
                property: 'StartDate',
                direction: 'ASC'
            }]
            
        });
        return deferred.promise; 
    }
        
   

});
