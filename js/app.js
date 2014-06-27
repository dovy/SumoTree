// UPDATE YOUR app_key AND auth_callback to get started
FamilySearch.init({
    //app_key: 'WCQY-7J1Q-GKVV-7DNM-SQ5M-9Q5H-JX3H-CMJK', // Sandbox
    app_key: 'KB2L-BVD1-3Q6S-J7X4-GKFZ-4168-QPZ6-NJRK', // Production
    //app_key: 'KB2L-BVD1-3Q6S-J7X4-GKFZ-4168-QPZ6-NJRK', // Staging
    //environment: 'sandbox',
    environment: 'production',
    //environment: 'staging',
    auto_expire: true,
    auto_signin: true,
    save_access_token: true,
    //access_token: 'USYSAB64A532864219B838B24990D3F6EF17_idses-prod02.a.fsglobal.net',
    auth_callback: document.location.protocol + '//' + document.location.hostname + '/',
    http_function: $.ajax,
    deferred_function: $.Deferred
}); 

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

    // Construct the url params from data values
    $(document.body).on('click', '.widgetAction', function () {
        var str = "";
        var obj = $(this)
            .data();
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
        $( document ).find('.popover').hide();
        loadContent();
        return false;
    });
    // No updating of that hash when it's just for a popover
    $(document.body).on('click', '.nameWrapper a, .personCard, .contributorCard', function (e) {
        e.preventDefault();
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



    function loadContent() {
        fsWidgets.getPID();
        fsWidgets.profileHeader( '.profileHeaderContainer', fsWidgets.pID );

        fsWidgets.familyMembers( '.familyWidgetContainer', fsWidgets.pID );
        if ( fsWidgets.currentUser.id != fsWidgets.pID ) {
            fsWidgets.sources( '.sourcesWidgetContainer', fsWidgets.pID );
            fsWidgets.changes( '.changesWidgetContainer', fsWidgets.pID );
            fsWidgets.changeHistory( '.changesHistoryWidgetContainer', fsWidgets.pID );
            fsWidgets.discussions( '.discussionsWidgetContainer', fsWidgets.pID );
            fsWidgets.notes( '.notesWidgetContainer', fsWidgets.pID );    
        }
        fsWidgets.pedigree( '.pedigreeWidgetContainer', fsWidgets.pID );
        // Blank open links
        $('a[rel="external"]').attr('target', '_blank');
    }

    FamilySearch.getAccessToken().then(function () {
        if (!fsWidgets.currentUser) {
            FamilySearch.getCurrentUserPersonId().then(function (response) {
                FamilySearch.getPerson( response ).then(function (response) {
                    fsWidgets.currentUser = fsWidgets.getPersonDetails( response.getPerson() );
                    fsWidgets.getPID();
                    loadContent();
                });
            });  
        } else {
            loadContent();    
        }
    });
});