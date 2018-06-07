import React from 'react';
import ReactDOM from 'react-dom';
import {createStore} from "redux";
import {Provider} from "react-redux";
import reducers from "./reducers/combiner"

import Master from './js/master';

let store = createStore(reducers);

ReactDOM.render(<Provider store={store}><Master /></Provider>, document.getElementById('root'));