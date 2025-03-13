import styled from "styled-components";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { BackButton } from "./BackButton";
import { useNavigate } from "react-router-dom";

const Navbar = styled.div`
  background-color: #b9c9bf;
  color: white;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/");
  };

  return (
    <>
      <Navbar>
        {window.location.pathname === "/" ? null : (
          <BackButton onClick={handleBack}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </BackButton>
        )}
        <div>
          {title ? (
            title
          ) : (
            <img
              src={require("./HyperGreen.png")}
              alt="logo"
              style={{ maxWidth: "60%" }}
            />
          )}
        </div>
      </Navbar>
    </>
  );
};

export default Header;
