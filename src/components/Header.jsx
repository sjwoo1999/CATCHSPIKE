import React, { useContext } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom"; // React Router를 사용하여 페이지 이동을 처리합니다.
import { UserContext } from "../context/LoginContext";

const HeaderContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 10px 0px;
    background-color: #5ddebe;
    position: fixed;
    top: 0;
    z-index: 1000;
    height: 30px;
`;

const SecondContainer = styled.div`
    max-width: 480px;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
`;

const Logo = styled.div`
    font-size: 24px;
    font-weight: bold;
    cursor: pointer;
`;

const NotificationIcon = styled.div`
    font-size: 24px;
    cursor: pointer;
`;

const LogoutButton = styled.button`
    margin-left: 30px;
`;

export default function Header() {
    const navigate = useNavigate();
    const { setAccessToken, setRefreshToken, setUserId } =
        useContext(UserContext);

    return (
        <HeaderContainer>
            <Logo onClick={() => navigate("/home")}>대충 로고</Logo>

            <SecondContainer>
                <NotificationIcon onClick={() => navigate("/notifications")}>
                    알림
                </NotificationIcon>
                <LogoutButton
                    onClick={() => {
                        localStorage.removeItem("accessToken");
                        setAccessToken(null);
                        setRefreshToken(null);
                        setUserId(null);
                        navigate("/");
                    }}
                >
                    로그아웃
                </LogoutButton>
            </SecondContainer>
        </HeaderContainer>
    );
}
