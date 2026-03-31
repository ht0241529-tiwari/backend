class ApiResponse {
    constructor(statusCode, data, message = "Success"){
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        // Agar status code 400 se kam hai (jaise 200, 201), matlab sab successful hai
        this.success = statusCode < 400; 
    }
}
export { ApiResponse }