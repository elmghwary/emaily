import path from "path";
import catchAsync from "../utils/catchAsync";
import AppError from "../utils/errorFactory";

export const contactUs = catchAsync(async (req, res, next) => {
  try {
    res.status(200).sendFile("index.html", {
      root: path.join(process.cwd(), "src", "public"),
    });
  } catch (e) {
    console.log(e);
    return next(
      new AppError(
        `There was an error rendering path: contact. Try again later!`,
        500
      )
    );
  }
});
