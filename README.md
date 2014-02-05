FamilySearch Widgets
========

An open source set of utilities built upon the [FamilySearch Javascript SDK](https://github.com/rootsdev/familysearch-javascript-sdk). 

To get started, provide your authorized key on your website.

## Built With
* [FamilySearch Javascript SDK](https://github.com/rootsdev/familysearch-javascript-sdk)
* [SumoTheme](http://rootsdev.org/SumoTheme/),  [Github Repo](https://github.com/rootsdev/SumoTheme)
* [FamilySearch Icons](http://rootsdev.org/familysearch-icons),  [Github Repo](https://github.com/rootsdev/familysearch-icons)
* [HoganJS](http://twitter.github.io/hogan.js/)

### Grunt
Use `grunt watch` to update LESS and hogan design templates

# Getting Started
To get started, you will need a FamilySearch developer key. Obtain that here: https://familysearch.org/developers/docs/guides/getting-started

Then open `~/js/app.js` and provide your key and the appropriate development, like so:
```
FamilySearch.init({    
    app_key: 'YOUR APP KEY', // Provided by FamilySearch
    environment: 'production', // sandbox, staging, production
    auth_callback: 'http://sumoapp.dev/', // Your callback URL you gave to FamilySearch
});
```

Then open up index.html and away you go!