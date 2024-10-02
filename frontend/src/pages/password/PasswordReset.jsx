import React from "react";


function PSWReset() {
    return (
        <div>
            <h1>Reset Password</h1>
            <form id="id_password_reset_form" method="POST" className="form-signin">
                <h1 className="h3 mb-3 font-weight-normal">Reset password</h1>
                <input name="email" className="form-control" placeholder="Email address" type="email" id="id_email"
                       required="true"/>
                <button id="id_submit_btn" className="btn btn-lg btn-primary btn-block">Send reset email</button>
            </form>
        </div>
    )
}

export default PSWReset;