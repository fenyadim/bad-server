export async function getCsrfToken(): Promise<string> {
    const res = await fetch('/csrf-token', { credentials: 'include' })
    const data = await res.json()
    return data.csrfToken
}
