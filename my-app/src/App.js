// src/App.js
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import {
  Layout,
  Menu,
  Button,
  Row,
  Col,
  Card,
  Typography,
  Divider,
} from "antd";
import {
  MessageOutlined,
  LoginOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import "./index.css";
import SignUp from "./auth/SignUp";
import Login from "./auth/Login";
import LandingFirstTimeAccount from "./individual/landing_firsttime_account";
import FinancialGradeChart from "./auth/FinancialGradeChart"
const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

function Home() {
  const nav = useNavigate();
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header className="nav">
        <div className="logo">
          <Text strong style={{ color: "#fff", marginLeft: 8 }}>Prosperity</Text>
        </div>

        <Menu theme="dark" mode="horizontal" selectable={false} className="nav-menu">
          <Menu.Item key="learn"><a href="#learn">Learn more</a></Menu.Item>
          <Menu.Item key="contact"><a href="#contact">Contact Us</a></Menu.Item>
        </Menu>

        <div className="nav-cta">
          <Button
            type="link"
            icon={<UserAddOutlined />}
            onClick={() => nav("/signup")}
            style={{ marginRight: 8, color: "#b7eb8f" }}
          >
            Sign up
          </Button>
          <Button type="primary" icon={<LoginOutlined />} onClick={() => nav("/login")}>
            LOG IN
          </Button>
        </div>
      </Header>

      <Content>
        <section className="hero" style={{ paddingTop: 120 }}>
          <Title level={2} style={{ marginBottom: 16 }}>
            Financial literacy for everyone
          </Title>
          <Paragraph style={{ fontSize: 16, opacity: 0.9 }}>
            A Duolingo-style coach that turns your real numbers into simple actions.
          </Paragraph>

          <Row gutter={[24, 24]} justify="center" style={{ marginTop: 24 }}>
            <Col xs={24} md={10}>
              <Card bordered className="select-card" onClick={() => nav("/signup")}>
                <Title level={3}>Individuals</Title>
                <Paragraph>Personalized lessons, goals & nudges.</Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={10}>
              <Card bordered className="select-card" onClick={() => nav("/login")}>
                <Title level={3}>Enterprises</Title>
                <Paragraph>Analytics & curriculum for your team.</Paragraph>
              </Card>
            </Col>
          </Row>
        </section>
        <section>
          <FinancialGradeChart />;
        </section>

        <section className="strip" id="learn">
          <Row gutter={[16, 16]} justify="center">
            <Col xs={24} md={7}>
              <Card className="strip-card" bordered={false}>
                <Paragraph>
                  “Small weekly changes beat big resolutions.”<br />
                  <Text type="secondary">— User, 6-week streak</Text>
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={7}>
              <Card className="strip-card circle" bordered={false}>
                <Title level={2}>+$140</Title>
                <Text type="secondary">avg. monthly savings after 3 actions</Text>
              </Card>
            </Col>
            <Col xs={24} md={7}>
              <Card className="strip-card" bordered={false}>
                <Paragraph>“Finally understood APR and paid off my card faster.”</Paragraph>
              </Card>
            </Col>
          </Row>
        </section>

        <section className="cta">
          <Title>Start your plan in 2 minutes</Title>
          <Paragraph>Answer a few questions → get a simple action plan.</Paragraph>
          <Button size="large" type="primary" onClick={() => nav("/signup")}>
            Get started
          </Button>
        </section>

        <section className="contact" id="contact">
          <Title level={3}>Contact Us</Title>
          <Paragraph>Email: hello@fined.app</Paragraph>
          <Divider />
        </section>
      </Content>

      <Footer style={{ textAlign: "center", background: "#001529", color: "#fff" }}>
        © {new Date().getFullYear()} FinEd • Privacy • Terms
      </Footer>

      <Button
        className="chat-fab"
        shape="round"
        size="large"
        icon={<MessageOutlined />}
        onClick={() => alert("Chat coming soon")}
      >
        Chat with us
      </Button>
    </Layout>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/app/individual/first-time" element={<LandingFirstTimeAccount />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
