$(document).ready(function () {

    $('a[rel="external"]').attr('target', '_blank');

    
    $(document).tooltip({
        selector: "[data-toggle=tooltip]",
        container: "body"
    });

    $('a.panel-collapse').click(function() {
        $(this).children().toggleClass("fa-chevron-down fa-chevron-up");
        $(this).closest(".panel-heading").next().slideToggle({duration: 200});
        $(this).closest(".panel-heading").toggleClass('rounded-bottom');
        return false;
    });


    function toggleChevron(e) {
        $(e.target)
            .prev('.panel-heading')
            .find("i.indicator")
            .toggleClass('glyphicon-chevron-down glyphicon-chevron-up');
    }
    $('.familyGroup').on('hidden.bs.collapse', toggleChevron);
    $('.familyGroup').on('shown.bs.collapse', toggleChevron);

    $('.tree-family a').on('click', function (e) {
        e.preventDefault();
        return false;
    });
    var id = "KWZH-X9C";
    if (window.location.hash) {
        id = window.location.hash.replace('#', '');
    }
    personSelect(id);

    $('#personSelect a').click(function () {
    	window.location.hash = $(this).attr('href');
        location.reload();
        //$.when($('.spouses-children h2, .parents-children h2').hide(), $('#familyView .spouses-children .panel, #familyView .parents-children .panel').remove(), personSelect($(this).attr('href').replace('#', ''))).done(function () {
         //   $('.spouses-children h2, .parents-children h2').fadeIn();
        //});
    });

    function personSelect(id) {
        $.when($.ajax('data/family/'+id + ".json"), $.ajax("templates/person.html"), $.ajax("templates/family.html"), $.ajax("templates/event.html"), $.ajax("templates/children.html")).done(function (obj, person, family, event, children) {
            data = obj[0].data;
            person = Hogan.compile(person[0]);
            family = Hogan.compile(family[0]);
            event = Hogan.compile(event[0]);


            var theData = new Array();
            var holder = new Object();
            console.log(data);
            $.each(data.spouses, function (k, spouse) {
                spouse.husband.gender = spouse.husband.gender.toLowerCase();
                if (!spouse.husband.name == "") {
                	spouse.husband.name = "Unknown";
                }
                spouse.wife.gender = spouse.wife.gender.toLowerCase();
                if (spouse.event) {
                    spouse.event.type = spouse.event.type.toLowerCase();
                    spouse.event.type = spouse.event.type.charAt(0).toUpperCase() + spouse.event.type.slice(1);
                }
                //var childrenString = "";
                if (spouse.children) {
                    var theChildren = new Array();
                    $.each(this.children, function (x, child) {
                        if (child.gender) {
                            child.gender = child.gender.toLowerCase();
                        }
                        spouse.children[x] = child;
                    });
                }
                //this.children = childrenString;
                $('.spouses-children').append(family.render(spouse));

            });
            $.each(data.parents, function (k, spouse) {
                spouse.husband.gender = spouse.husband.gender.toLowerCase();
                if (!spouse.husband.name) {
                	spouse.husband.name = "Unknown";
                }
                spouse.wife.gender = spouse.wife.gender.toLowerCase();
                if (!spouse.wife.name) {
                	spouse.wife.name = "Unknown";
                }
                if (spouse.event) {
                    spouse.event.type = spouse.event.type.toLowerCase();
                    spouse.event.type = spouse.event.type.charAt(0).toUpperCase() + spouse.event.type.slice(1);
                }
                //var childrenString = "";
                if (spouse.children) {
                    var theChildren = new Array();
                    $.each(this.children, function (x, child) {
                        if (child.gender) {
                            child.gender = child.gender.toLowerCase();
                        }
                        spouse.children[x] = child;
                    });
                }
                //this.children = childrenString;
                $('.parents-children').append(family.render(spouse)).fadeIn();
            });
            return true;
        });
    }
});