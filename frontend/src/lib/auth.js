export const setAuth = (data) => {
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("token", data.access_token);
    window.dispatchEvent(new Event("auth-change"));
};

export const getUser = () => {
    if (typeof window === "undefined") return null;

    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
};

export const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("auth-change"));
};