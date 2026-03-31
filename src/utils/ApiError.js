class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ){
        super(message); // super() original Error class ke message ko set karta hai
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.success = false; // Error hai toh success hamesha false hoga
        this.errors = errors;

        // Ye line batati hai ki error kis file/line number pe aaya (Debugging ke liye best)
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
export { ApiError }