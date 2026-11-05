export class HttpError extends Error {
    constructor(status, message, code, extra = {}) {
        super(message);
        this.status = status;
        this.appCode = code;
        Object.assign(this, extra);
    }
}