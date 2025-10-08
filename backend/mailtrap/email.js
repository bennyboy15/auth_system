import { mailtrapClient, sender } from "./mailtrap.config.js";
import { VERIFICATION_EMAIL_TEMPLATE, PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE } from "./emailTemplates.js";

export async function sendVerificationEmail(email, verificationToken) {
    const recipient = [{email}];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Verify your email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
            category: "Email Verification"
        });

        console.log("Email sent successfully", response)
    } catch (error) {
        console.log("Verification email failed to send");
        throw new Error("Error sending verification email:", error);
    }
}

export async function sendWelcomeEmail(email, name) {
    const recipient = [{ email }];

	try {
		const response = await mailtrapClient.send({
			from: sender,
			to: recipient,
			template_uuid: "2c0eaacf-dd53-4018-998c-5cecc2876167",
			template_variables: {
				company_info_name: "Auth Company",
				name: name,
			},
		});

		console.log("Welcome email sent successfully", response);
	} catch (error) {
		console.error(`Error sending welcome email`, error);

		throw new Error(`Error sending welcome email: ${error}`);
	}
}

export async function sendForgotPasswordEmail(email, link) {
    const recipient = [{ email }];

	try {
		const response = await mailtrapClient.send({
			from: sender,
			to: recipient,
            subject:"Forgot password",
			html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", link),
            category: "Forgot password"
		});

		console.log("Forgot password email sent successfully", response);
	} catch (error) {
		console.error(`Error sending Forgot password email`, error);

		throw new Error(`Error sending Forgot password email: ${error}`);
	}
};

export async function sendResetSuccessEmail(email) {
	const recipient = [{ email }];

	try {
		const response = await mailtrapClient.send({
			from: sender,
			to: recipient,
            subject:"Updated password",
			html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            category: "Updated password"
		});

		console.log("Updated password email sent successfully", response);
	} catch (error) {
		console.error(`Error sending Updated password email`, error);

		throw new Error(`Error sending Updated password email: ${error}`);
	}
}