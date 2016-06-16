import axios from 'axios';
import { browserHistory } from 'react-router';
import { joinRoom,
         createUserSockets} from '../sockets_client';

export const CREATE_SESSION = 'CREATE_SESSION';
export const SET_USER_TYPE= 'SET_USER_TYPE';
export const CREATE_USERNAME= 'CREATE_USERNAME';
export const LINK_CODE_AUTH= 'LINK_CODE_AUTH';
export const LINK_CODE_ERROR= 'LINK_CODE_ERROR';
export const CREATE_GAME= 'CREATE_GAME';
export const ACTIVATE_GAME= 'ACTIVATE_GAME';
export const SET_ACTIVE_CLUE= 'SET_ACTIVE_CLUE';
export const RESET_CLUE_VALUE= 'RESET_CLUE_VALUE';

export function createSession() {
  return function(dispatch){
    axios.post('/create')
      .then( response => {
        dispatch({type: CREATE_SESSION, payload: response});
        browserHistory.push('/linklanding');
      })
  }
}

export function setUserType(value) {
  return {
    type: SET_USER_TYPE,
    payload: value
  }
}

export function linkCodeVerification({linkcode}) {
  return function(dispatch, getState){
    axios.post('/linkcode', {linkcode})
      .then(response => {
        const currentState= getState();
        currentState.user.userType !== 'host' ? browserHistory.push('/userconfig') : browserHistory.push('/hostgameplay');
        joinRoom(response.data.room);
        dispatch({type: LINK_CODE_AUTH, payload: response.data.room})
      })
      .catch(response => {
        console.log('error REsponse', response);
        dispatch({type: LINK_CODE_ERROR, payload: response.data.error});
      })
  }
}

export function createUser(username, photo) {
  return function(dispatch, getState){
        const currentState = getState();
        dispatch({type: CREATE_USERNAME, payload: username});
        createUserSockets(username, photo, currentState.linkAuth.linkCode);
        browserHistory.push('/usergameplay');
  }
}

export function fetchGame(){
  return function(dispatch){
    axios.post('/game')
      .then(response => {
        var tempClues= response.data.clues;
        var tempCluesFin= {categories: tempClues.categories, clues: {}};
        for (var i= 0; i< tempClues.clues.length; i+=5){
          tempClues.clues[i].value= 200;
          tempClues.clues[i+1].value= 400;
          tempClues.clues[i+2].value= 600;
          tempClues.clues[i+3].value= 800;
          tempClues.clues[i+4].value= 1000;
        }
        for (var j=0; j< tempClues.clues.length; j++){
          tempCluesFin.clues[tempClues.clues[j].id]= tempClues.clues[j];
        }
        //console.log('tempCluesFin', tempCluesFin);
        console.log(tempCluesFin);
        dispatch({type: CREATE_GAME, payload: tempCluesFin});

      })
      .catch(response => {
        console.log(response);
      })
  }
}

export function resetClueValue(clue){
  clue.value= 0;
  return {type: RESET_CLUE_VALUE, payload: clue}
}