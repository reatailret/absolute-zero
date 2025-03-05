namespace $.$$ {
	export class $optimade_zero_profile extends $.$optimade_zero_profile {
		
		@$mol_mem
		email(next?: string) {
			
			return next ?? ''
		}

		@$mol_mem
		email_bid() {
			
			try {
				$mol_data_email(this.email())
				return ''
			} catch (error) {
				return 'Enter valid email'
			}
		}
		
		@$mol_mem
		password_bid() {
			
			return this.password() ? '' : 'Enter password'
		}

		@$mol_mem
		login_submit_disabled() {
			
			return !!this.email_bid() || !!this.password_bid()
		}

		@$mol_action
		event_login_submit() {
			
			try {
				this.api().login(this.email(), this.password())
			} catch (error) {
				if($mol_promise_like(error)) {
					$mol_fail_hidden(error);
				} else {
					this.login_status('Login failed')
					console.log(error)
					// set random sid
					//this.api().user_sid($mol_guid(16))
				}
			}
			
		}
		@$mol_action
		event_logout() {
			this.api().logout()
		}
		@$mol_mem
		login_status(next?: string) {
			return next ?? (this.api().user_sid() ? 'logged in' : 'not logged in')
		}
		@$mol_mem
		page_content(){
			return this.api().user_sid() ? [this.LogoutRow()] : [this.LoginRow()]
		}
	}
}
