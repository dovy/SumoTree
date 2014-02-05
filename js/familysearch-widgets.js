var fsWidgets = new function() {  

    this.people = new Array();
    this.pID = "";
    this.currentUser = "";
    
    /*
     * Get the personID from hash tag 
     */
    this.getPID = function () {
        var id = window.location.hash.replace('#', '');
        id = id.replace('pid=', '');
        id = id.split('&', 1);
        fsWidgets.pID = id[0];
        if (!fsWidgets.pID) {
            fsWidgets.pID = fsWidgets.currentUser.id;
        }
    }

    this.profileHeader = function( container, pID ) {
        $( container ).hide();

        if ( fsWidgets.pID == fsWidgets.currentUser.personId ) {
            $( container ).html( fsWidgetTemplates['profileHeader.html'].render( fsWidgets.currentUser ) ).fadeIn();
        } else {
            FamilySearch.getPerson( pID ).then(function (response) {
                var person = fsWidgets.getPersonDetails( response.getPerson() );
                if (!person) {
                    return;
                }
                $( container ).html( fsWidgetTemplates['profileHeader.html'].render( person ) ).fadeIn();
            });            
        }
    }


    /*
     * Construct a person details object
     */    
    this.getPersonDetails = function ( response ) {

        // Start the data object. Starting with the primary person.
        var data = response.display;
        // Grab the ID
        data.id = response.id;
        // If already cached, return it
        if (fsWidgets.people[data.id]) {
            //return fsWidgets.people[data.id];
        }
        // Grab the LifeSpan
        data.lifespan = response.$getLifeSpan();
        data.isLiving = response.living;
        // Cache that person - remove when in SDK
        fsWidgets.people[data.id] = data;
        if (data.gender) {
            data.gender = data.gender.toLowerCase()
        }
        return data;

    }

    this.getChildrenPromise = function( fatherID, motherID ) {
        return FamilySearch.getPersonWithRelationships( fatherID, {persons: true}).then(function(response) {
            var children = new Array();
            var childList = response.getChildrenOf( motherID );
            for (var i = 0, len = childList.length; i < len; i++) {
                children.push( fsWidgets.getPersonDetails( childList[i] ) );
            }
            return children;
        });
    }

    /*
     * Get all parent-child relationships from a given relationship
     */   
    this.getParentChildRelationshipData = function( relationships, response ) {
        var results = [];
        var relPromises = [];
        for (var i = 0, len = relationships.length; i < len; i++) {
            var rel = relationships[i];
            var data = {
                'rid': rel.id,
                'husband': fsWidgets.getPersonDetails(response.getPerson(rel.$getFatherId())),
                'wife': fsWidgets.getPersonDetails(response.getPerson(rel.$getMotherId())),
                'fatherRelationship': fsWidgets.getFactData(rel.$getFatherFacts()),
                'motherRelationship': fsWidgets.getFactData(rel.$getMotherFacts())
            };
            results.push(data);
        }
        return results;

    }

    /*
     * Get all spouse relationships from a given relationship
     */ 
    this.getSpouseRelationshipData = function( relationships ) {
        var results = [];
        for (var i = 0, len = relationships.length; i < len; i++) {
            var rel = relationships[i];
            results.push({
                'relationshipID': rel.id,
                'husband': rel.getHusbandId(),
                'wife': rel.getWifeId(),
                'pid': rel.getPrimaryId(),
                'sid': rel.getSpouseId(),
                'events': fsWidgets.getFactData(rel.getFacts())
            });
        }
        return results;
    }

    /*
     * Construct fact data about a given fact
     */ 
    this.getFactData = function( facts ) {
        var results = [];
        for (var i = 0, len = facts.length; i < len; i++) {
            var fact = facts[i];
            results.push({
                'id': fact.id,
                //'Contributor': fact.getContributor(),
                'type': fact.type,
                'modified': fact.modified,
                'place': fact.$getPlace()
            });
        }
        return results;
    }

    //--> FAMILY MEMBERS WIDGET
    
    /*
     * familyMembers widget construct
     */ 
    this.familyMembers = function ( container, pID ) {
            
        function childPromise( pID ) {
            FamilySearch.getPerson( pID ).then(function (response) {
                return fsWidgets.getPersonDetails( response.getPerson() );
            });
        }

        if ( !container ) {
            return;
        }
        $(container).hide();

        if ( !pID ) {
            fsWidgets.getPID();
            pID = fsWidgets.pID;
        }

        FamilySearch.getPersonWithRelationships( pID, { persons: true }).then(function (response) {
            // Add the widget container if it doesn't already exist
            if ( !$('.spouses-children').length ) {
                $( container ).html(fsWidgetTemplates['familyContainer.html'].render());
            }
            var fathers = response.getFatherIds();
            var mothers = response.getMotherIds();
            // The render object
            var render = new Array();
            render.families = new Array();
            render.families[0] = new Array();
            // Start the data object. Starting with the primary person.
            var data = fsWidgets.getPersonDetails(response.getPrimaryPerson());
            if ( data.gender == "male" ) {
                render.families[0].husband = data;
            } else if ( data.gender == "female" ) {
                render.families[0].wife = data;
            }
            data.spouses = new Array();
            var spouses = response.getSpouses();
            for ( var s = 0, spousesLength = spouses.length; s < spousesLength; s++ ) {
                if ( !render.families[s] ) {
                    render.families[s] = new Object();
                }
                data.spouses[s] = fsWidgets.getPersonDetails(spouses[s]);
                if ( data.gender == "male" ) {
                    render.families[s].husband = render.families[0].husband;
                    render.families[s].wife = data.spouses[s];
                } else if ( data.gender == "female" ) {
                    render.families[s].wife = render.families[0].wife;
                    render.families[s].husband = data.spouses[s];
                }
                var children = response.getChildren(spouses[s].id);
                data.spouses[s].children = new Array();
                for ( var c = 0, childrenLength = children.length; c < childrenLength; c++ ) {
                    data.spouses[s].children[c] = fsWidgets.getPersonDetails(children[c]);
                }
                render.families[s].children = data.spouses[s].children;
            }
            data.parents = new Array();
            
            data.parents = fsWidgets.getParentChildRelationshipData( response.getParentRelationships(), response);
            var childPromises = [];
            for (var i = 0, len = data.parents.length; i < len; i++) {
                childPromises.push( fsWidgets.getChildrenPromise( data.parents[i].husband.id, data.parents[i].wife.id ) );
            }

            $.when.apply($, childPromises).then(function () {

                for (var i = 0, len = arguments.length; i < len; i++) {
                    data.parents[i].children = arguments[i];
                }

                for (var i = 0, len = data.parents; i < len; i++) {
                    data.parents.families[p].children = arguments[i];
                }
                var immediate = fsWidgetTemplates['family.html'].render(render, {
                    person: fsWidgetTemplates['person.html'],
                    popover: fsWidgetTemplates['popover.html'],
                    event: fsWidgetTemplates['event.html']
                });

                var parentFamilies = new Array();

                $('.spouses-children').html(immediate);
                parentFamilies.families = data.parents;
                var parental = fsWidgetTemplates['family.html'].render(parentFamilies, {
                    person: fsWidgetTemplates['person.html'],
                    popover: fsWidgetTemplates['popover.html'],
                    event: fsWidgetTemplates['event.html']
                });
                $('.parents-children').html(parental);
                // Must reload the popover for the new content
                $('.personcard').popover({
                    html: true,
                    content: function () {
                        return fsWidgetTemplates['popover.html'].render( fsWidgets.people[$(this).data('pid')] );
                    }
                });  
                $( container ).fadeIn();
            });     
        });
    };




    //--> SOURCES WIDGET
    
    /*
     * sources widget construct
     */ 
    this.sources = function( container, pID ) {
        if ( !container ) {
            return;
        }
        $(container).hide();

        function getSourceDetails( source ) {
            var details = {
                id: source.id,
                url: source.about,
                note: source.notes[0].text,
                title: source.titles[0].value,
                citation: source.citations[0].value,
                contributor: source.attribution.contributor.resourceId.replace('cis.user.', ''),
                modified: new Date(source.attribution.modified).toISOString(),
                url: source.about
            };
            if ( !details.url ) {
                delete details.url;    
            }
            

            return details;
        }        

        FamilySearch.getPersonSourceRefs( pID ).then(function (response) {
            var srcRefs = response.getSourceRefs(); 

            FamilySearch.getMultiSourceDescription( srcRefs ).then(function(response) {

                var sources = new Array();

                for (var key in response) {
                    sources.push( getSourceDetails( response[key].getSourceDescription() ) );
                }
                if (!sources) {
                    return;
                }

                var theData = {
                    sources: sources
                };

                $( container ).html( fsWidgetTemplates['sourcesContainer.html'].render() );
                $( '.source-objects' ).html( fsWidgetTemplates['source.html'].render( theData ) );
                jQuery("abbr.timeago").timeago();
                $( container ).fadeIn();

            });
        });
    }

    //--> DISCUSSIONS WIDGET
    /*
     * DISCUSSIONS widget construct
     */ 

    this.discussions = function ( container, pID ) {

        function commentsDetails( comment ) {
            var data = {
                id: comment.id,
                created: new Date(comment.created).toISOString(),
                text: comment.text,
                contributor: comment.contributor.resourceId.replace('cis.user.', ''),
            };
            return data;
        }

        function discussionWidgetDetails(discussion) {

            return FamilySearch.getComments( discussion.id ).then(function (response) {
                var data = {
                    id: discussion.id,
                    htmlId: discussion.id.replace('ds.disc.', ''),
                    title: discussion.title,
                    description: discussion.details,
                    contributor: discussion.contributor.resourceId.replace('cis.user.', ''),
                    created: new Date(discussion.created).toISOString(),
                    modified: new Date(discussion.modified).toISOString(),
                    commentNumber: discussion.numberOfComments,
                    comments: new Array()
                };                
                var comments = response.getComments();
                for (var i = 0, len = comments.length; i < len; i++) {
                    data.comments.push( commentsDetails( comments[i] ) );
                }
                return data;
            });

        }

        if ( !container ) {
            return;
        }
        $(container).hide();    

        FamilySearch.getPersonDiscussionRefs( pID ).then(function (response) {
            var ids = response.getDiscussionRefs();
            FamilySearch.getMultiDiscussion(ids).then(function(response) {
                
                var dPromises = [];
                $.each(response, function( index, value ) {
                    value = value.getDiscussion();
                    dPromises.push( discussionWidgetDetails( value ) );
                });
                $.when.apply($, dPromises).then(function () {
                    if ( !arguments ) {
                        return; 
                    }
                    var discussions = new Array();
                    for (var i = 0, len = arguments.length; i < len; i++) {
                        discussions[i] = arguments[i];
                    }
                    
                    var theData = {
                        discussions: discussions
                    };
                    var discussionsData = fsWidgetTemplates['discussion.html'].render(theData, {
                        comment: fsWidgetTemplates['discussionComment.html'],
                    });
                    $( container ).html( fsWidgetTemplates['discussionsContainer.html'].render() );
                    $( '.discussion-objects' ).html(discussionsData);
                    jQuery("abbr.timeago").timeago();               

                    $( container ).fadeIn();

                });
            });
        });
    };


    //--> NOTES WIDGET
    /*
     * NOTES widget construct
     */ 

    this.notes = function( container, pID ) {
        if ( !container ) {
            return;
        }
        $(container).hide();

        function getNoteDetails( noteURL ) {
            return FamilySearch.getPersonNote( noteURL ).then(function (response) {
                var note = response.getNote();

                var details = {
                    id: note.id,
                    subject: note.subject,
                    text: note.text,
                    contributor: note.attribution.contributor.resourceId,
                    modified: new Date(note.attribution.modified).toISOString(),
                };    

                return details;
            });
        }        

        FamilySearch.getPersonNoteRefs( pID ).then(function (response) {
            var noteRefs = response.getNoteRefs(); 

            var nPromises = [];
            for (var i = 0, len = noteRefs.length; i < len; i++) {
                nPromises.push( getNoteDetails( noteRefs[i].$getNoteUrl() ) );
            }

            $.when.apply($, nPromises).then(function () {

                if ( !arguments ) {
                    return; 
                }
                var notes = new Array();
                for (var i = 0, len = arguments.length; i < len; i++) {
                    notes[i] = arguments[i];
                }
                
                var theData = {
                    notes: notes
                };

                $( container ).html( fsWidgetTemplates['notesContainer.html'].render() );
                $( '.note-objects' ).html( fsWidgetTemplates['note.html'].render( theData ) );
                jQuery("abbr.timeago").timeago();
                $( container ).fadeIn();

            });
        });
    }

    this.pedigree = function ( container, pID ) {
        $( container ).hide();

        var family = FamilySearch.getAncestry( pID, {personDetails: true} ).then(function(response) {
            response = response.getPersons();
            var ancestors = new Array();
            for (var i = 1; i <= 14; i++) {
                ancestors['node'+i] = {};
            };
            for (var i = 0, len = response.length; i < len; i++) {
                ancestors['node'+response[i].getAscendancyNumber()] = fsWidgets.getPersonDetails( response[i] );
            }
            ancestors['node1'].focus = true;
            
            for (var i = 8; i <= 14; i++) {
                ancestors['node'+i].empty = true;
            };


            $( container ).html( fsWidgetTemplates['pedigreeContainer.html'].render( ancestors, {
                node: fsWidgetTemplates['pedigreeNode.html'],
                popover: fsWidgetTemplates['popover.html']
            } ) ).fadeIn();

            // Must reload the popover for the new content
            $('.personcard').popover({
                html: true,
                content: function () {
                    return fsWidgetTemplates['popover.html'].render( fsWidgets.people[$(this).data('pid')] );
                }
            });

          
        });


    }


    //--> CHANGES WIDGET
    
    /*
     * changes widget construct
     */ 
    this.changes = function ( container, pID ) {

        function changeWidgetDetails(change) {
            
            var data = {
                id: change.id,
                title: change.title,
                modified: new Date( change.updated ).toISOString(),
                contributor: change.contributors[0].name,
            }
            
            return data;

        }

        if ( !container ) {
            return;
        }
        $(container).hide();
        
        // Get the person source references
        FamilySearch.getPersonChanges( pID ).then(function (response) {

            if (!response.entries) {
                return;
            }
            
            var changes = new Array();
            for (var c = 0, changeLength = response.entries.length; c < changeLength; c++) {
                if (c >= 5) {
                    break;
                }
                changes[c] = changeWidgetDetails(response.entries[c]);
            }
            if (!changes) {
                return;
            }
            var theData = {
                changes: changes,
                total: response.entries.length
            };

            $( container ).html( fsWidgetTemplates['changesContainer.html'].render() );
            $( '.change-objects' ).html( fsWidgetTemplates['change.html'].render(theData) );
            jQuery("abbr.timeago").timeago();

            $( container ).fadeIn();

        });
    }


}