import React from "react";

function PasswordChange() {
  return (
    <div className="items-center">
      <h1>Password Change</h1>
        <form id="id_password_change_form" method="POST">
            <input name="old_password" className="" placeholder="Old password" type="password"
                   id="id_old_password" required="true"/>
            <input name="new_password1" className="" placeholder="New password" type="password"
                   id="id_new_password1" required="true"/>
            <input name="new_password2" className="" placeholder="Confirm password" type="password"
                   id="id_new_password2" required="true"/>
            <button id="id_submit_btn" className="btn btn-lg btn-primary btn-block" type="submit">Submit</button>
        </form>

    </div>
);
}

export default PasswordChange;