Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    logger: new Rally.technicalservices.Logger(),
    items: [
         {xtype:'container',itemId:'display_box'} 
        /*,
        {xtype:'tsinfolink'}
        */
    ],
    calculation_type: 'total', //'total', //cumulative, iteration
    iterations: [],
    completed_state_values: ['accepted','completed'],
    completed_state_field: 'ScheduleState',
    estimate_field: 'PlanEstimate',
    launch: function() {
        this.logger.log('Project',this.getContext().getProject());
        this.cb_release = this.down('#display_box').add({
            xtype: 'rallyreleasecombobox',
            scope:this,
            startDateField: 'ReleaseStartDate',
            endDateField: 'ReleaseDate',
            storeConfig: {context: {projectScopeDown: false},
                          fetch: ['ReleaseStartDate','ReleaseDate','ObjectID','Project','State','Name']},
            listeners: {
                scope: this,
                change: this._updateRelease
            } 
        });
        
   },
   _getReleaseStartDate: function(){
       return this.cb_release.getRecord().get('ReleaseStartDate').toISOString();
   },

   _getReleaseEndDate: function(){
       return this.cb_release.getRecord().get('ReleaseDate').toISOString();
   },
   
   _updateRelease: function(cb, newValue, oldValue){
       this.logger.log('_updateRelease', newValue, oldValue);
       var record = cb.findRecordByValue(newValue);
       var projectRef = record.get('Project')._ref;
       var selectedReleaseIds = [record.get('ObjectID')];

       var me = this; 

           atDate = "current";  
           var me = this;
           //Retrieve the stories for the release and calculate the rollups
           Ext.create('Rally.data.lookback.SnapshotStore', {
               scope: this,
               listeners: {
                   scope: this,
                   load: function(store, data, success){
                       me.logger.log('_updateRelease returned data',data);
                       me._buildTreeStore(data, selectedReleaseIds);
                   }
               },
               autoLoad: true,
               fetch: ['Name','FormattedID','ObjectID','_ItemHierarchy','_TypeHierarchy','Release'],
               hydrate: ['_TypeHierarchy'],
               filters: [{
                         property: '_TypeHierarchy',
                         operator: 'in',
                        //TODO: this needs to be configurable for the name for USPTO
                         value: ['PortfolioItem/Epic']
               },{  //TODO:  May need to get all releases for a selected release over multiple teams 
                   property: 'Release',
                   operator: 'in',
                   value: selectedReleaseIds
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
    _loadDetailData: function(topLevelObjectIds, asOfDate){
        this.logger.log('_loadDetailData', topLevelObjectIds);
        var me = this;

        var deferred = Ext.create('Deft.Deferred');
        Ext.create('Rally.data.lookback.SnapshotStore', {
            scope: this,
            listeners: {
                scope: this,
                load: function(store, data, success){
                    if (success){
                        me.logger.log('_loadDetailData',data.length);
                        deferred.resolve(data);
                    } else {
                        me.logger.log('_loadDetailData failure');
                        deferred.reject('Error loading details for portfolio items');
                    }
                }
            },
            autoLoad: true,
            fetch: ['Name','FormattedID','ObjectID','_ItemHierarchy',me.estimate_field,me.completed_state_field,'Iteration','Release','DirectChildrenCount','Children','UserStories','_TypeHierarchy'],
            hydrate: [me.completed_state_field,'_TypeHierarchy'],
            find: {
                "_ItemHierarchy": {$in: topLevelObjectIds},
                "_TypeHierarchy": {$in: ['PortfolioItem']},
                "__At": "current"
            }
        });      
        return deferred.promise; 
    },
    _loadStoryDetailData: function(epics, asOfDate){
        this.logger.log('_loadStoryDetailData', epics);
        var me = this;

        var deferred = Ext.create('Deft.Deferred');
        Ext.create('Rally.data.lookback.SnapshotStore', {
            scope: this,
            listeners: {
                scope: this,
                load: function(store, data, success){
                    if (success){
                        me.logger.log('_loadStoryDetailData',data.length);
                        deferred.resolve(data);
                    } else {
                        me.logger.log('_loadStoryDetailData failure');
                        deferred.reject('Error loading details for stories');
                    }
                }
            },
            autoLoad: true,
            fetch: ['Name','FormattedID','ObjectID','_ItemHierarchy',me.estimate_field,me.completed_state_field,'Iteration','Release','Epic','Feature','PortfolioItem','Parent','_TypeHierarchy'],
            hydrate: [me.completed_state_field,'_TypeHierarchy'],
            find: {
                "_ItemHierarchy": {$in: epics},
                "_TypeHierarchy": {$in: ['HierarchicalRequirement']},
                "__At": asOfDate,
                "DirectChildrenCount": 0  //return leaf node stories only 
            }
        });      
        return deferred.promise; 
    },
    _getRollupEstimatedField: function(index){
        return '_RollupEstimated_' + this._getIterationKey(index);
    },
    _getRollupCompletedField: function(index){
        return '_RollupCompleted_' + this._getIterationKey(index);
    },
    _getIterationName: function(index){
        return this.iterations[index][0] + "<br>" + this.iterations[index][3] + "<br>" + this.iterations[index][1];
    },
    _getIterationKey: function(index){
        return 'I' + this.iterations[index][0];
    },
    _getIterationIndex: function(iteration_id) {
        for (var i=0; i<this.iterations.length; i++){
            if (this.iterations[i][0] == iteration_id){
                return i;
            }
        }
        return -1;
    }, 
    _getCalculationType: function(){
        return this.calculation_type;
    },
    _populateObject: function(id,data_hash, story_data){
        this.logger.log('_populateObject', id, data_hash[id]);
        var me = this;
        var obj = data_hash[id];
        if (obj == undefined){
            return obj;
        }

        var tree_obj=[];
        tree_obj['__Type'] = obj.get('_TypeHierarchy').slice(-1)[0];
        tree_obj['ObjectID'] = id;
        tree_obj['FormattedID'] = obj.get('FormattedID');
        tree_obj['Name']=obj.get('Name');

        //initialize the rollups
        for (var i=0; i< me.iterations.length; i++){
            tree_obj[me._getRollupCompletedField(i)] = 0;
            tree_obj[me._getRollupEstimatedField(i)] = 0;
            tree_obj[me._getIterationKey(i).toString()] = me._getIterationKey(i).toString();
        }
        
        var children = me._getChildren(id, data_hash,story_data);
        tree_obj['children'] = children;
        if (children.length == 0){
            tree_obj['leaf'] =  true; 
        }

        if (tree_obj['__Type'] == 'PortfolioItem/Epic'){
            tree_obj = this._rollupStories(story_data,tree_obj);
            tree_obj['leaf'] =  true; 
        }
        
        this._calculateRollups(tree_obj);
       
        return tree_obj; 
    },
    _getChildren: function(parent_id,data_hash,story_data){
        this.logger.log('_getChildren',parent_id);
        var children = [];
        var me= this;
        
        var obj = data_hash[parent_id];
        if (obj == undefined){
            return children;
        }
        
        var child_obj_ids = [];
        console.log('childrenx',obj.get('FormattedID'),obj.get('Children'));
       if (obj.get('Children') && obj.get('Children').length > 0){
            child_obj_ids = obj.get('Children');
            Ext.Array.each(child_obj_ids, function(child_id){
                var child_obj = me._populateObject(child_id,data_hash,story_data);
                if (child_obj != undefined){
                    children.push(child_obj);
                }
            });
        } 
       
        return children; 
    },

    _rollupStories: function(story_data, obj){
        //populates the lowest level PIs with rollups 
        var me = this;
        me.logger.log('_rollupStories', obj['ObjectID'], obj['FormattedID'],story_data);
        var total_estimated = 0;
        Ext.Array.each(story_data, function(sd){
            var sd_data = sd.getData();
            var belongsToFeature = Ext.Array.contains(sd_data._ItemHierarchy, obj['ObjectID']);
            if (belongsToFeature){
                var iteration_index = me._getIterationIndex(sd_data.Iteration);  //Move this down below if we want all estimates for feature, even if they aren't in current iterations
                if (iteration_index >= 0 ){
                    total_estimated = total_estimated + sd_data.PlanEstimate;
                    if (me._isCompleted(sd_data.ScheduleState)){
                        obj[me._getRollupCompletedField(iteration_index)] = obj[me._getRollupCompletedField(iteration_index)] + sd_data.PlanEstimate;
                   }
                }
            }
        });

        //This makes the denominator the total rollup for the entire release for all items...
        var cumulative_completed = 0;  
        for (var i=0; i< me.iterations.length; i++){
            cumulative_completed = cumulative_completed + obj[me._getRollupCompletedField(i)];
            obj[me._getRollupEstimatedField(i)]=total_estimated;
            obj[me._getRollupCompletedField(i)]= cumulative_completed;
            console.log('Epic Rollups',obj['FormattedID'],me._getIterationKey(i),obj[me._getRollupEstimatedField(i)],obj[me._getRollupCompletedField(i)]);
        }
        
        return obj;
   },
   _isCompleted: function(state){
       return (Ext.Array.contains(this.completed_state_values, state.toLowerCase()))
   },
    _buildTreeNodeDataStructure: function(pi_data,story_data,topLevelObjectIds, epics){
        this.logger.log('_buildTreeNodeDataStructure',pi_data,story_data);

        var me = this; 
        
        //Get an array of all relevant portfolio items.  Relevant means portfolio items which are associated with the 
        //selected release or an ancestor of the pis associated with the selected release.  
        var filtered_obj_ids = [];
        Ext.Array.each(pi_data,function(pi){
            if (Ext.Array.contains(epics,pi.get('_ItemHierarchy').slice(-1)[0])){
                Ext.Array.each(pi.get('_ItemHierarchy'),function(ih){
                    if (!Ext.Array.contains(filtered_obj_ids,ih)){
                        filtered_obj_ids.push(ih);
                    }
                });
            }
        });

        //Add relevant Portofolio items to the data hash by verifying that they exist in the list of ancestor PIs  
        var data_hash = [];
        Ext.Array.each(pi_data, function(detail){
            var obj_id = detail.get('ObjectID');
            if (Ext.Array.contains(filtered_obj_ids,obj_id)){
                data_hash[obj_id] = detail;
            }
        });
        
        var topLevelObjects = [];
        Ext.Array.each(topLevelObjectIds, function(top_id){
          topLevelObject = me._populateObject(top_id,data_hash, story_data);
           if (topLevelObject){
              
              topLevelObjects.push(topLevelObject);
          }
        });
        
        this.logger.log('_buildTreeNodeDataStructure',topLevelObjects);
        return topLevelObjects;
    }, 

   _calculateRollups: function(object_tree){
        var me = this;
        me.logger.log('_calculateRollups', object_tree['children'], object_tree['ObjectID']);
        
        var children = object_tree['children'];
        if (!(children && children.length > 0)) {
            return; 
        }

        var cumulative_completed = 0; //cumulative total for each  iteration 
        var cumulative_estimated = 0;
        var total_estimated = 0;
        for(var i=0; i<me.iterations.length; i++){
            var iteration_estimated = 0;
            var iteration_completed=0;
            Ext.Array.each(children, function(child){
//                if (child.leaf == false ){
                    iteration_estimated = iteration_estimated + child[me._getRollupEstimatedField(i)];
                    iteration_completed = iteration_completed + child[me._getRollupCompletedField(i)];

                    object_tree[me._getRollupEstimatedField(i)] = iteration_estimated;
                    object_tree[me._getRollupCompletedField(i)] = iteration_completed;
//                } else {  // for leaf children when doing cumulative roll ups
//                    cumulative_estimated = cumulative_estimated + child[me._getRollupEstimatedField(i)];
//                    cumulative_completed = cumulative_completed + child[me._getRollupCompletedField(i)];
//                    
//                    object_tree[me._getRollupEstimatedField(i)] = cumulative_estimated;
//                    object_tree[me._getRollupCompletedField(i)] = cumulative_completed;
//                }
            });
            if (i==me.iterations.length-1) total_estimated = total_estimated + object_tree[me._getRollupEstimatedField(i)];
            console.log('children',object_tree['FormattedID'],me._getIterationKey(i),object_tree[me._getRollupEstimatedField(i)],object_tree[me._getRollupCompletedField(i)]);

        }

        //This makes the denominator the total
        for (var i=0; i< me.iterations.length; i++){
            object_tree[me._getRollupEstimatedField(i)]=total_estimated;
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
            fields.push({name: me._getIterationKey(i), type:'String'});
            fields.push({name: me._getRollupEstimatedField(i), type:'Float'});
            fields.push({name: me._getRollupCompletedField(i), type:'Float'});
        }
            
        var model = {
            extend: 'Ext.data.Model',
            fields: fields
        };
        me.logger.log("Made a model using these fields: ", fields);
        return model;
    },
    _getLowestLevelObjectIds: function(data){
        var object_ids = [];
        Ext.Array.each(data,function(item){
            object_ids.push(item.data['ObjectID']);
        });
        return object_ids;
    },
    _loadTreeData: function(lowest_level_pi_objects, asOfDate){
        //Basically load all the PI data in the item hierarchy for hte lower level objects
        var me = this; 
        var object_ids = [];
        Ext.Array.each(lowest_level_pi_objects,function(llpi){
            var item_hierarchy = llpi.data['_ItemHierarchy'];
            Ext.Array.each(item_hierarchy,function(ih){
                object_ids.push(ih);
            });
        });
        me.logger.log('_loadTreeData',lowest_level_pi_objects.length, object_ids);
        var deferred = Ext.create('Deft.Deferred');
        Ext.create('Rally.data.lookback.SnapshotStore', {
            scope: this,
            listeners: {
                scope: this,
                load: function(store, data, success){
                    if (success){
                        me.logger.log('_loadTreeData success', data);
                        deferred.resolve(data);
                    } else {
                        me.logger.log('_loadTreeData.failure');
                        deferred.reject('Error loading details for top level object ids');
                    }
                }
            },
            autoLoad: true,
            fetch: ['Name','FormattedID','ObjectID','_ItemHierarchy','Iteration','Release','DirectChildrenCount','Children','UserStories','_TypeHierarchy'],
            filters: [{
                      property: 'ObjectID',
                      operator: 'in',
                      value: object_ids
            },
            {
                property: '__At',
                value: "current"
            }]
        });      
        return deferred; 

    },
    _buildTreeStore: function(data, releases){
        this.logger.log('_buildTreeStore', data);
        var me = this;  
        var topLevelObjects = this._getTopLevelObjectIds(data);
        var tree_nodes = {};
        var epics = this._getLowestLevelObjectIds(data);

        var promises = [];
        promises.push(this._loadDetailData(topLevelObjects,"current"));
        promises.push(this._loadStoryDetailData(epics,"current"));

        Deft.Promise.all(promises).then({
            scope:this,
            success: function(returned_data){
                this.logger.log('Loading Data success.', returned_data);

                //Now load the iterations that we want to have as column headers.  
                this._loadIterations(returned_data[1]).then({
                    scope:this, 
                    success: function(){
                        this.logger.log('Loaded Iterations:', me.iterations);
                        tree_nodes = me._buildTreeNodeDataStructure(returned_data[0],returned_data[1],topLevelObjects,epics);
                        var model = me._defineFieldModel();
                        Ext.define('TSTreeModelWithIterations', model);        
                        
                        var treeStore = Ext.create('Ext.data.TreeStore',{
                            model: TSTreeModelWithIterations,
                            root: {
                                expanded: false,
                                children: tree_nodes
                                }
                        });
                        me._buildTree(treeStore); 
                    },
                    failure: function(){
                        this.logger.log('Loading Iterations failed.');
                    }
                });
            },
            failure: function(){
                this.logger.log('Loading Data failed.');
            }
        });
    },
    
    _buildTree: function(tree_store){
        this.logger.log('_buildTree');
        var me = this;
        
        if (me.down('#pi-progress-tree')){
            me.down('#pi-progress-tree').destroy();
        }

        var tree_columns = me._getTreeColumns();
        me.down('#display_box').add({
            scope:this,
            xtype:'treepanel',
            itemId: 'pi-progress-tree',
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
            var column_index = me._getIterationKey(i);

            var iteration_column = {
                    dataIndex: column_index,
                    text: column_header,
                    itemId:column_index + '_column',
                    width: 100,
                    renderer: function(value,meta_data,record) {
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
    
    _loadIterations: function(story_data){
        this.logger.log('_loadIterations');
        var me = this;
        var deferred = Ext.create('Deft.Deferred');

        var release_start_date = this._getReleaseStartDate();
        var release_end_date = this._getReleaseEndDate();
        
        var filter = Ext.create('Rally.data.wsapi.Filter', { property:'StartDate',operator: '<', value: release_end_date });
        filter = filter.and(Ext.create('Rally.data.wsapi.Filter', { property:'EndDate',operator: '>', value: release_start_date }));

        var epic_iterations = [];
        Ext.Array.each(story_data, function(sd){
            if(!Ext.Array.contains(epic_iterations,sd.getData().Iteration)){
                epic_iterations.push(sd.getData().Iteration);
            }
        });
        
        
        Ext.create('Rally.data.wsapi.Store',{
            model: 'Iteration',
            autoLoad: true,
            listeners: {
                scope:this,
                load: function(store, data, success){
                    if (success){
                        this.logger.log('Success loading Iterations', data);
                        
                        
                        me.iterations = [];
                        Ext.Array.each(data,function(rec){
                            var rec_data = rec.getData();
                            if (Ext.Array.contains(epic_iterations,rec_data.ObjectID)){
                                me.iterations.push([rec_data.ObjectID,rec_data.Name,rec_data.EndDate,rec_data.Project.Name]);
                            }
                       });
                        this.logger.log(me.iterations);
                        deferred.resolve();                        
                    } else {
                        this.logger.log('Failed loading Iterations', success);
                        deferred.reject();
                    }
                }
            },
            filters: filter,
            fetch: ['ObjectID','Name','StartDate','EndDate','Project','Workspace'] ,
            context: {project: null},
            sorters: [{
                property: 'StartDate',
                direction: 'ASC'
            }]
            
        });
        return deferred.promise; 
    },
    x_loadIterations: function(releaseStartDate, releaseEndDate){
        this.logger.log('_loadIterations');
        var deferred = Ext.create('Deft.Deferred');

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
            fetch: ['ObjectID','Name','StartDate','EndDate','Project','Workspace'] ,
            context: {project: null},
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
