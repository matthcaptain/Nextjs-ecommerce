import React, { useState, useRef, useEffect, useContext } from 'react';
import styles from './AuthGlobalStyles.module.scss';
import googleIcon from '../../assets/google-icon.svg';
import { Input, Button, Form, Alert } from 'antd';
import { useNavigate } from 'react-router-dom';

import { DispatchContext, StateContext, ACTIONS } from '../../App';

export default function SignIn() {

    // consume auth contexts
    const { dispatch } = useContext(DispatchContext);
    const { state } = useContext(StateContext);

    const navigate = useNavigate();

    const [signInState, setSignInState] = useState({
        email: '',
        password: ''
    });

    const [error, setError] = useState({
        emailError: null,
        passwordError: null,
    });

    const [allowedToCallApiState, setAllowedToCallApiState] = useState(false);

    const [apiError, setApiError] = useState({
        errorMessage: null
    });

    const emailElement = useRef(null);
    const passwordElement = useRef(null);
    
    useEffect(() => {
        if (allowedToCallApiState) {

            const signInRequest = async () => {
                const bodyData = {
                    email: signInState.email,
                    password: signInState.password
                }

                try {
                    const response = await fetch('http://localhost:5500/api/user/signin', {
                        method: 'POST',
                        credentials: "include",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(bodyData)
                    });
                    const data = await response.json();

                    console.log(data);

                    if (data.success) {
                        console.log('success login');
                        
                        dispatch({ 
                            type: ACTIONS.LOGIN_SUCCESS, 
                            payload: {
                                email: data.userData.email,
                                role: data.userData.role
                        }});

                        navigate('/vendor/dashboard');
                    } else {
                        // if user is not confirmed redirect to email confirm page
                        if (data.message === "User is not confirmed.") {
                            navigate('/auth/confirm-email');
                            return;
                        }

                        dispatch({ type: ACTIONS.LOGIN_ERROR });

                        setApiError({
                            errorMessage: data.message
                        });
                    }

                } catch(error) {
                    console.log('api error', error);
                }
            }

            if (error.emailError === null && error.passwordError === null) {
                signInRequest();
                // alert('called the api');

                // reset the apiError to default
            } else {
                // disable api access when errors are present
                setAllowedToCallApiState(false);
            }

        }
    }, [error]);

    const handleInputChange = (e) => {
        setSignInState({...signInState, [e.target.name]: e.target.value});
    }

    const validateEmail = (value) => {

        // validate empty fields
        if (value === "") {
            setError(error => ({...error, emailError: {
                validateStatus: "error",
                help: "This field is required",
            }}));
        } else {
            // validate email address format
            if (! /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value)) {
                setError(error => ({...error, emailError: {
                        validateStatus: "error",
                        help: "Not a valid email"
                    }}));

            } else {
                setError(error => ({ ...error, emailError: null }));
            }
        }
    }

    const validatePassword = (value) => {

        if (value === "") {
            // validate empty fields
            setError(error => ({ ...error, passwordError: {
                    validateStatus: "error",
                    help: "This field is required",
            }}));
        } else {
            setError(error => ({ ...error, passwordError: null }));

            // length must be more than 7 characters
            if (value.length < 7) {
                setError(error => ({...error, passwordError: {
                        validateStatus: "error",
                        help: "must be more than 7 characters"
                }}));
            } else {
                setError(error => ({ ...error, passwordError: null }));
            }
        }
    }

    // const resetInputFields = () => {    
    //     // reset input fields
    //     setSignInState({
    //         email: "",
    //         password: ""
    //     });
    // }

    const handleSignIn = () => {

        validateEmail(signInState.email);
        validatePassword(signInState.password);
        
        // alllow api to make requests
        setAllowedToCallApiState(true);
    }

    return (
        <div className={styles.authBox}>
            <p className={styles.heading}>Login to your account</p>
            {apiError.errorMessage ? <Alert message={apiError.errorMessage} type="error" style={{ marginBottom: "24px" }} /> : null}
            <div className={styles.row}>
                <Form.Item {...(error.emailError ? error.emailError : {})}>                    
                    <label>Email</label>
                    <Input 
                        ref={emailElement} 
                        name="email" 
                        onBlur={(e) => validateEmail(e.target.value)} 
                        onChange={handleInputChange} 
                        value={signInState.email}
                    />
                </Form.Item>
            </div>
            <div className={styles.row}>
                <Form.Item {...(error.passwordError ? error.passwordError : {})}>
                    <label>Password</label>
                    <Input
                        ref={passwordElement}
                        name="password"
                        onBlur={(e) => validatePassword(e.target.value)} 
                        onChange={handleInputChange} 
                        value={signInState.password} 
                    />
                </Form.Item>
            </div>
            <div className={`${styles.row} ${styles.center}`}>
                <a onClick={() => navigate('/auth/forgot-password')} className={styles.forgotPassword}>Forgot Password</a>
            </div>
            <div className={styles.row}>
                <Button onClick={() => handleSignIn()} className='themed-btn'>Log In</Button>
            </div>
            <div className={`${styles.row} ${styles.withGoogle}`}>
                <img src={googleIcon} />
                <p>Sign in with google</p>
            </div>
            <div className={styles.row}>
                <div className={`${styles.inline} ${styles.center}`}>
                    <p>Didn't have an account ?</p>
                    <a onClick={() => navigate('/auth/signup')}>Sign up</a>
                </div>
            </div>
        </div>

        // <>
        //     <button style={{ marginTop: "200px"}} onClick={() => dispatch({ type: ACTIONS.LOGIN_SUCCESS, payload: {email: "lakshan", role: "buyer"} })}>logged in</button>
        //     <hr/>
        //     <p>hello :{state.value}</p>
        //     <button onClick={() => dispatch({ type: ACTIONS.LOGIN_ERROR })}>logout</button>
        // </>
    )
}