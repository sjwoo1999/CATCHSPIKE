import React, { useState, useContext, useEffect } from "react";
import styled from "styled-components";
import { format, isAfter, startOfDay } from "date-fns"; 
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { UserContext } from "../../context/LoginContext";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  text-align: center;
`;

const ReportList = styled.div`
  display: flex;
  flex-direction: column;
  list-style: none;
  padding: 0;
  width: 80%;
  max-width: 600px;
  margin: 0 auto;
  text-align: left;
`;

const ReportItem = styled.div`
  padding: 10px;
  margin: 10px 0;
  background: #f0f0f0;
  border-radius: 10px;
`;

const Button = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  margin-bottom: 20px;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const DatePickerContainer = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const AlertMessage = styled.div`
  color: red;
  margin-bottom: 10px;
`;
const CreateReportButton = styled(Button)`
  margin-top: 20px;
`;

const ConfirmationModal = styled(Overlay)`
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
`;

const ModalButton = styled(Button)`
  margin: 10px;
`;

const LoadingMessage = styled.div`
  margin-top: 20px;
  font-size: 18px;
  font-weight: bold;
`;

export default function DailyReportPage() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dailyReport, setDailyReport] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [isFilled, setIsFilled] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { accessToken, userId } = useContext(UserContext);

  useEffect(() => {
    if (dailyReport) {
      console.log("dailyReport updated:", dailyReport);
    }
  }, [dailyReport]);

  const handleDateChange = async (date) => {
    const today = startOfDay(new Date());
    if (isAfter(date, today)) {
      setAlertMessage("오늘 이후의 날짜는 선택할 수 없습니다. 다시 선택해주세요.");
      return;
    }

    setSelectedDate(date);
    setShowDatePicker(false);
    setAlertMessage("");
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_PORT}/report/daily`,
        {
          userId: userId,
          date: format(date, "yyyy-MM-dd"),
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setIsValid(response.data.isValid);
      setIsFilled(response.data.isFilled);
      if (response.data.isValid) {
        setDailyReport(response.data.dailyReport);
      } else {
        setDailyReport(null);
      }
    } catch (error) {
      console.error("Error fetching report:", error);
      setAlertMessage("레포트를 가져오는 데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateReport = () => {
    setShowConfirmation(true);
  };

  const handleConfirmCreateReport = async () => {
    setShowConfirmation(false);
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_PORT}/report/newDaily`,
        {
          userId: userId,
          date: format(selectedDate, "yyyy-MM-dd"),
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          timeout: 120000 // 2분 타임아웃 설정
        }
      );

      setDailyReport(response.data);
      console.log("response.data : ", response.data);
      console.log("dailyReport : ", dailyReport);
      
      setIsValid(true);
    } catch (error) {
      console.error("Error creating report:", error);
      setAlertMessage("레포트 생성에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <h3>일간 레포트 리스트 페이지</h3>
      <Button onClick={() => setShowDatePicker(true)}>
        날짜 선택
      </Button>
      {alertMessage && <AlertMessage>{alertMessage}</AlertMessage>}
      {showDatePicker && (
        <Overlay>
          <DatePickerContainer>
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              maxDate={new Date()}
              inline
            />
          </DatePickerContainer>
        </Overlay>
      )}
      {isLoading ? (
        <LoadingMessage>레포트를 생성 중입니다...</LoadingMessage>
      ) : (
        selectedDate && (
          <ReportList>
            {isValid ? (
              <>
                <ReportItem>
                  totalCalories : {dailyReport.totalCalories}
                </ReportItem>
                <ReportItem>
                  totalTraning : {dailyReport.totalTraining}
                </ReportItem>
                <ReportItem>
                  dietFeedback : {dailyReport.dietFeedback}
                </ReportItem>
                <ReportItem>
                  execiseFeedback : {dailyReport.exerciseFeedback}
                </ReportItem>
              </>
            ) : (
              <>
                <ReportItem>
                  <div>레포트가 존재하지 않습니다.</div>
                </ReportItem>
                <CreateReportButton onClick={handleCreateReport}>
                  레포트 생성하기
                </CreateReportButton>
              </>
            )}
          </ReportList>
        )
      )}
      {showConfirmation && (
        <ConfirmationModal>
          <ModalContent>
            <p>
              {isFilled
                ? "레포트를 생성하시겠습니까?"
                : "오늘 기록하지 않은 식단이 있습니다. 레포트를 받으시겠습니까? 레포트를 받으면 다시 수정할 수 없습니다."}
            </p>
            <ModalButton onClick={handleConfirmCreateReport}>확인</ModalButton>
            <ModalButton onClick={() => setShowConfirmation(false)}>취소</ModalButton>
          </ModalContent>
        </ConfirmationModal>
      )}
    </Container>
  );
}