import catchAsync from "../utils/catchAsync";
import { EmailServiceFactory } from "../utils/email";
import AppError from "../utils/errorFactory";

export const contactUs = catchAsync(async (req, res, next) => {
  if (!process.env.CONTACT_US_EMAIL || !process.env.SUPPORT_EMAIL) {
    return next(new AppError("Emails not configured!", 500));
  }

  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return next(new AppError("All fields are required!", 400));
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return next(new AppError("Invalid email address!", 400));
    }

    const contactUs = await EmailServiceFactory.createContactUsSender().send({
      recipient: { name: "Admin", email: process.env.CONTACT_US_EMAIL },
      sender: { name, email },
      message,
      subject,
    });
    if (!contactUs.success) {
      return next(new AppError(contactUs.message, contactUs.statusCode));
    }

    const confirm =
      await EmailServiceFactory.createContactConfirmationSender().send({
        recipient: { name, email },
        sender: { name: "Support Team", email: process.env.SUPPORT_EMAIL },
        message: "Thank you for contacting us!",
      });
    if (!confirm.success) {
      return next(new AppError(confirm.message, confirm.statusCode));
    }

    res.status(200).json({
      status: "success",
      message: "Email sent successfully",
    });
  } catch (e) {
    console.log(e);
    return next(
      new AppError(
        "There was an error sending the email. Try again later!",
        500
      )
    );
  }
});
