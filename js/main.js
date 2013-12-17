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






















});

