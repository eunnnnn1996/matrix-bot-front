import axios from "axios"

const api = axios.create({
  baseURL: "http://localhost:8080"
})

// 요청 인터셉터
api.interceptors.response.use(

  res => res,

  async error => {

    if(error.response?.status === 401){

      const refreshToken = localStorage.getItem("refreshToken")

      const res = await axios.post(
        "http://localhost:8080/auth/refresh",
        { refreshToken }
      )

      const newAccessToken = res.data.accessToken

      localStorage.setItem("accessToken", newAccessToken)

      error.config.headers.Authorization = "Bearer " + newAccessToken

      return axios(error.config)
    }

    return Promise.reject(error)
  }

)

export default api