var people = new Array();

if (!window.location.hash) {
	window.location.hash = "#pid=KW7S-VQJ"
}

$(document).ready(function () {

    $(document.body).on('click', '.widgetAction', function() {
			var str = "";
			var obj = $(this).data();
			for (var key in obj) {
				if (key == "bs.popover") {
    			continue;
    		}
		    if (str != "") {
		        str += "&";
		    }
		    str += key + "=" + obj[key];
			}
      window.location.hash = str;
      run();
      return false;
    });

    $(document.body).on('click', '.nameWrapper a', function(e) {
			e.preventDefault();
      return false;
    });    

	function run() {

    id = window.location.hash.replace('#', '');
    id = id.replace('pid=', '');
    id = id.split('&', 1);
    id = id[0];

	  FamilySearch.getAccessToken().then(function () {
	      FamilySearch.getPersonWithRelationships(id, {persons: true   }).then(function (response) {
	      		
	      		var render = new Array();
	      		render.families = new Array();
	      		render.families[0] = new Array();

	      		var data = response.getPrimaryPerson().getDisplayAttrs();
	      		data.id = response.getPrimaryPerson().getId();
	      		data.lifespan = response.getPrimaryPerson().getLifeSpan();
	      		people[data.id] = data;

	      		if (data.gender) {
	      			data.gender = data.gender.toLowerCase()
	      		}
	      		var mode = "";
	      		if (data.gender == "male") {
	      			render.families[0].husband = data;
	      		} else if (data.gender == "female") {
	      			render.families[0].wife = data;
	      		}
	      		data.spouses = new Array();
	      		var spouses = response.getSpouses();
	          for (var s = 0, spousesLength = spouses.length; s < spousesLength; s++) {
	          	if (!render.families[s]) {
	          		render.families[s] = new Object();
	          	}

	          	data.spouses[s] = spouses[s].getDisplayAttrs();
	          	data.spouses[s].id = spouses[s].getId();
	          	data.spouses[s].lifespan = spouses[s].getLifeSpan();
		      		if (data.spouses[s].gender) {
		      			data.spouses[s].gender = data.spouses[s].gender.toLowerCase();
		      		}	          	
		      		people[data.spouses[s].id] = data.spouses[s];
	          	if (data.gender == "male") {
	          		render.families[s].husband = render.families[0].husband;
	          		render.families[s].wife = data.spouses[s];
	          	} else if (mode == "female") {
	          		render.families[s].wife = render.families[0].wife;
	          		render.families[s].husband = data.spouses[s];
	          	}
	          	
	          	//if (data.spouses[s])
	          	var children = response.getChildren(spouses[s].getId());
	          	data.spouses[s].children = new Array();
	          	for (var c = 0, childrenLength = children.length; c < childrenLength; c++) {
	          		data.spouses[s].children[c] = children[c].getDisplayAttrs();
	          		data.spouses[s].children[c].id = children[c].getId();
	          		data.spouses[s].children[c].lifespan = children[c].getLifeSpan();
								data.spouses[s].children[c].gender = data.spouses[s].children[c].gender.toLowerCase();
								people[data.spouses[s].children[c].id] = data.spouses[s].children[c];
	          	}
	          	render.families[s].children = data.spouses[s].children;
	          }
	          var parents = response.getParentRelationships();	
	          for (var p = 0, parentsLength = parents.length; p < parentsLength; p++) {
	          	//parents[p].data = get
	          }
//	          console.log(response);
//	          console.log(render);
	          //console.log(people);
	          var html = SumoWidgets['family.html'].render(render, {
	          	person:SumoWidgets['person.html'],
	          	popover:SumoWidgets['popover.html'],
	          	event:SumoWidgets['event.html']
	          });
	          $('.spouses-children').html(html);

	$('.personcard').popover({
		html : true, 
		content : function() {
			return SumoWidgets['popover.html'].render(people[$(this).data('pid')]);
		}
	});

	$('.widgetAction').on('click', function() {

	});

	$(':not(#anything)').on('click', function (e) {
	    $('.personcard').each(function () {
	        //the 'is' for buttons that trigger popups
	        //the 'has' for icons and other elements within a button that triggers a popup
	        if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
	            $(this).popover('hide');
	            return;
	        }
	    });
	});
	         /*
	          
	          var data = {
	              'Primary Id': response.getPrimaryId(),
	              'Primary Name': response.getPrimaryPerson().getName(),
	              'Parent Relationships': getParentChildRelationshipData(response.getParentRelationships()),
	              'Spouse Relationships': getSpouseRelationshipData(response.getSpouseRelationships()),
	              'Child Relationships': getParentChildRelationshipData(response.getChildRelationships()),
	              'Father Ids': response.getFatherIds(),
	              'Mother Ids': response.getMotherIds(),
	              'Spouse Ids': response.getSpouseIds(),
	              'Child Ids': response.getChildIds(),
	              'Fathers': getRelativeData(response.getFathers()),
	              'Mothers': getRelativeData(response.getMothers()),
	              'Spouses': getRelativeData(spouses)
	          };
	          for (var s = 0, spousesLength = spouses.length; s < spousesLength; s++) {
	              data['Children of ' + spouses[s].getName()] = getRelativeData(response.getChildren(spouses[s].getId()));
	          }
	          console.log(data);
	          output('Person with relatives', data);
	          output('Raw json response with convenience functions', response);
	          */
	      });
	  });
	}

	function getBasePersonInfo() {
/*
id
name
gender
birthdate
birthplace
deathdate
deathplace		
*/
	}

	function getParentChildRelationshipData(relationships) {
	  var results = [];
	  for (var i = 0, len = relationships.length; i < len; i++) {
	      var rel = relationships[i];
	      results.push({
	          'Id': rel.getId(),
	          'Father Id': rel.getFatherId(),
	          'Mother Id': rel.getMotherId(),
	          'Child Id': rel.getChildId(),
	          'Father Facts': getFactData(rel.getFatherFacts()),
	          'Mother Facts': getFactData(rel.getMotherFacts())
	      });
	  }
	  return results;
	}

	function getSpouseRelationshipData(relationships) {
	  var results = [];
	  for (var i = 0, len = relationships.length; i < len; i++) {
	      var rel = relationships[i];
	      results.push({
	          'Id': rel.getId(),
	          'Husband Id': rel.getHusbandId(),
	          'Wife Id': rel.getWifeId(),
	          'Primary Id': rel.getPrimaryId(),
	          'Spouse Id': rel.getSpouseId(),
	          'Facts': getFactData(rel.getFacts())
	      });
	  }
	  return results;
	}

	function getFactData(facts) {
	  var results = [];
	  for (var i = 0, len = facts.length; i < len; i++) {
	      var fact = facts[i];
	      results.push({
	          'Id': fact.getId(),
	          'Contributor': fact.getContributor(),
	          'Type': fact.getType(),
	          'Date': fact.getDate(),
	          'Formal Date': fact.getFormalDate(),
	          'Place': fact.getPlace()
	      });
	  }
	  return results;
	}

	function getRelativeData(persons) {
	  var data = [];
	  for (var i = 0, len = persons.length; i < len; i++) {
	      data.push({
	          'Id': persons[i].getId(),
	          'Name': persons[i].getName()
	      });
	  }
	  return data;
	}

	FamilySearch.init({
	  app_key: 'KB2L-BVD1-3Q6S-J7X4-GKFZ-4168-QPZ6-NJRK',
	  environment: 'production',
	  save_access_token: true,
	  auth_callback: 'http://sumoapp.dev/',
	  http_function: $.ajax,
	  deferred_function: $.Deferred
	});

	run();

  $('#personSelect a').click(function () {
  	window.location.hash = $(this).attr('href');
    run();
      //$.when($('.spouses-children h2, .parents-children h2').hide(), $('#familyView .spouses-children .panel, #familyView .parents-children .panel').remove(), personSelect($(this).attr('href').replace('#', ''))).done(function () {
       //   $('.spouses-children h2, .parents-children h2').fadeIn();
      //});
  });	

	function output(label, data) {
	  $('#output').append(label ? '<h3>' + label + '<h3>' : '<hr>');
	  $('#output').append(data ? prettyPrint(data) : '');
	}  



});