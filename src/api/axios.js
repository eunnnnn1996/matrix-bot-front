import axios from "axios"

const api = axios.create({
  baseURL: "http://localhost:8080"
})

/* 요청 인터셉터 (JWT 자동 첨부) */
api.interceptors.request.use(config => {

  const token = localStorage.getItem("accessToken")

  if (token) {
    config.headers.Authorization = "Bearer " + token
  }

  return config
})

/* 응답 인터셉터 (토큰 만료시 refresh) */
api.interceptors.response.use(

  res => res,

  async error => {

    if (error.response?.status === 401) {

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