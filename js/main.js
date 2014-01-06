$(document).ready(function () {

    // Toggle tooltip
    $(document).tooltip({
        selector: "[data-toggle=tooltip]",
        container: "body"
    });

    // Toggle panels/widget collapse
    $(document).on('click', 'a.panel-collapse', function() {
        $(this).children().toggleClass("fa-chevron-down fa-chevron-up");
        $(this).closest(".panel-heading").next().slideToggle({duration: 200});
        $(this).closest(".panel-heading").toggleClass('rounded-bottom');
        return false;
    });



});

