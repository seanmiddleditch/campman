export class ContentError extends Error
{
    public readonly errors?: any

    public constructor(message: string, {errors}: {errors?: any})
    {
        super(message)
        this.errors = errors
    }
}
