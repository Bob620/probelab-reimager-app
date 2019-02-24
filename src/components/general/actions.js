import { CreateActions } from 'bakadux';

module.exports = CreateActions([
	{
		actionType: 'toggleTest',
		func: ({stores, history}) => {
//			const generalStore = stores.general;

//			history.pushState({page: generalStore.get('page')}, '/map');
//			generalStore.set('page', 'map');
		}
	}
]);