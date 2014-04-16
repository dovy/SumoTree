

$(document).ready(function () {
    // Toggle tooltip
    $(document).tooltip({
        selector: "[data-toggle=tooltip]",
        container: "body"
    });

    $('.toggleMinimize').click(function(e) {
        e.preventDefault();
        var parent = $(this).parents('.family-panel:first');
        if ($(this).text() == "Close") {
            parent.find('.wellContent').slideUp();
            $(this).text($(this).text().replace('Close', 'Open'));
        } else {
            parent.find('.wellContent').slideDown();
            $(this).text($(this).text().replace('Open', 'Close'));
        }
        return false;
    });



    $('.toggleDetails').click(function(e) {
        e.preventDefault();
        var parent = $(this).parents('.family-panel:first');

        if ($(this).text() == "Show Details") {
            $(this).text($(this).text().replace('Show', 'Hide'));
            $.each(parent.find('.detailsWell'), function( ) {
                if (!$(this).hasClass('editing')) {
                    $(this).find('.hiddenDetails').show();
                    $(this).addClass('well openDetails');
                }
            });
        } else {
            $(this).text($(this).text().replace('Hide', 'Show'));
            $.each(parent.find('.detailsWell'), function( ) {
                if (!$(this).hasClass('editing')) {
                    $(this).find('.hiddenDetails').hide();
                    $(this).removeClass('well openDetails');
                }
            });
        }

        return false;
    });

    // Toggle panels/widget collapse
    $(document).on('click', 'a.panel-collapse', function () {
        $(this).children().toggleClass("fa-chevron-down fa-chevron-up");
        $(this).closest(".panel-heading").next().slideToggle({duration: 200});
        $(this).closest(".panel-heading").toggleClass('rounded-bottom');
        if ($(this).attr('data-original-title') == "Close") {
            $(this).attr('data-original-title', $(this).attr('data-original-title').replace('Close', 'Open'));
            $(this).parent().find('.toggleDetails').hide();
        } else {
            if ($(this).attr('data-original-title')) {
                $(this).attr('data-original-title', $(this).attr('data-original-title').replace('Open', 'Close'));
            }
            $(this).parent().find('.toggleDetails').show();
        }
        return false;
    });

    $('.closeDetail').click(function(e) {
        e.preventDefault();
        var parent = $(this).parents('.detailsWell:first');
        parent.removeClass('well').removeClass('openDetails');
        var toggle = $(this).parents('.family-panel:first').find('.toggleDetails');
        if ( parent.parents('.family-panel:first').find('.openDetails').length != 0 ) {
            toggle.text(toggle.text().replace('Show', 'Hide'));
        } else {
            toggle.text(toggle.text().replace('Hide', 'Show'));
        }
        return false;
    });


    $('.editDetail').click(function(e) {
        e.preventDefault();
        $(this).parents('.detailsWell:first').removeClass('openDetails').addClass('well').addClass('editing');
        return false;
    });

    $('.cancelButton').click(function(e) {
        e.preventDefault();
        var parent = $(this).parents('.detailsWell:first');
        var toggle = $(this).parents('.family-panel:first').find('.toggleDetails');

        if ($(this).parents('.family-panel:first').find('.detailsWell').length > 1) {
            toggle.text(toggle.text().replace('Show', 'Hide'));
            parent.removeClass('editing').addClass('openDetails');
        } else {
            parent.removeClass('editing well');
            toggle.text(toggle.text().replace('Hide', 'Show'));
        }
        return false;
    });

    // Only one popover open at time
    $(':not(#anything)').on('click', function (e) {

        $('.contributorCard').each(function () {
            //the 'is' for buttons that trigger popups
            //the 'has' for icons and other elements within a button that triggers a popup
            if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
                $(this).popover('hide');
                return;
            }
        });
    });

    $('.btn').button()

});