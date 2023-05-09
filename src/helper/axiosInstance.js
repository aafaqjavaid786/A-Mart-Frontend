import axios from "axios"

const axiosInstance = () => {

    console.log(`${process.env.REACT_APP_ENV}`)

    process.env.REACT_APP_ENV === "production"
      ? console.log(`${process.env.REACT_APP_MAIN_SERVER_URL_PRODUCTION}`)
      : console.log(`${process.env.REACT_APP_MAIN_SERVER_URL_DEVELOPMENT}`);

    const userInfo = localStorage.getItem("userInfo")
        ? JSON.parse(localStorage.getItem("userInfo"))
        : null

    //
    const axiosInst = axios.create({
        baseURL:
            process.env.REACT_APP_ENV === "production"
                ? `${process.env.REACT_APP_MAIN_SERVER_URL_PRODUCTION}`
                : `${process.env.REACT_APP_MAIN_SERVER_URL_DEVELOPMENT}`,
        timeout: 99999999999999999999,
        headers: {
            Authorization: userInfo ? `Bearer ${userInfo.token}` : null,
            "Content-Type": "application/json",
            accept: "application/json",
        },
    })

    axiosInst.interceptors.response.use(
        (response) => {
            // Any status code from range of 2xx
            // Do something with response data
            return response
        },
        (error) => {
            // Any status codes outside range of 2xx
            // Do something with response error
            return Promise.reject(error)
        }
    )

    axiosInst.interceptors.request.use(
        function (config) {
            // Do something before request is sent
            config.url = config.url.replace(config.baseURL, "")

            return config
        },
        function (error) {
            // Do something with request error
            return Promise.reject(error)
        }
    )

    return axiosInst
}

export default axiosInstance

