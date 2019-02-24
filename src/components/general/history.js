import dispatcher from 'bakadux';

dispatcher.setOnLand(({stores, path, redirectOrigin}) => {
	let page = 'landing';

	switch(path.toLowerCase()) {
		case '/':
			dispatcher.setOriginState({page: 'landing'});
			stores.general.set('page', 'landing');
			break;
		// Redirect all pages to the origin with a state
		default:
			redirectOrigin({page});
			break;
	}
});

dispatcher.setOnHistoryNavigate(({stores}, state) => {
	if (state.page)
		stores.main.set('page', state.page);
});