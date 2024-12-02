import { BASE_URL } from "./constants"

import { useSelector } from "react-redux";
import { RootState } from "../store/store";

const { token } = useSelector((state: RootState) => state.user);

export const fetchUser = async () => {
    const url = BASE_URL + "user/fetchUser";
    const res = await fetch (url, {
        method: "POST",
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            authorization: "Bearer " + token,
        },
    })
    const data = await res.json();
    console.log(data);
    if (data.success) {
        console.log(data.user);
    }
    else {
        console.log(data.message);
    }
}