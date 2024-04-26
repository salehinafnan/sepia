// File: client/src/actions/auth.js

import { AUTH, SET_ERROR } from "../constants/actionTypes";
import * as api from "../api/index.js";

export const signin = (formData, router) => async (dispatch) => {
  try {
    const { data } = await api.signIn(formData);

    dispatch({ type: AUTH, data });

    router.push("/");
  } catch (error) {
    dispatch({ type: SET_ERROR, payload: error.response.data.message });
  }
};

export const signup = (formData, router) => async (dispatch) => {
  try {
    const { data } = await api.signUp(formData);

    dispatch({ type: AUTH, data });

    router.push("/");
  } catch (error) {
    dispatch({ type: SET_ERROR, payload: error.response.data.message });
  }
};
