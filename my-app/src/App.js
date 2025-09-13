// src/App.js
import { Layout, Menu, Button, Row, Col, Card, Typography, Divider } from "antd";
import { Link } from "react-router-dom";
import { MessageOutlined, LoginOutlined, UserAddOutlined } from "@ant-design/icons";
import "./index.css";

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

export default function App() {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* NAVBAR */}
      <Header className="nav">
        <div className="logo">
          <img src="/logo192.png" alt="logo" />
          <Text strong style={{ color: "#fff", marginLeft: 8 }}>FinEd</Text>
        </div>

        <Menu theme="dark" mode="horizontal" selectable={false} className="nav-menu">
          <Menu.Item key="learn"><a href="#learn">Learn more</a></Menu.Item>
          <Menu.Item key="contact"><a href="#contact">Contact Us</a></Menu.Item>
        </Menu>

        <div className="nav-cta">
          <Button type="link" icon={<UserAddOutlined />} href="#signup" style={{ marginRight: 8, color: "#b7eb8f" }}>
            Sign up
          </Button>
          <Button type="primary" icon={<LoginOutlined />} href="#login">LOG IN</Button>
        </div>
      </Header>

      {/* HERO */}
      <Content>
        <section className="hero">
          <Title level={2} style={{ marginBottom: 16 }}>
            Financial literacy for everyone
          </Title>
          <Paragraph style={{ fontSize: 16, opacity: 0.9 }}>
            A Duolingo-style coach that turns your real numbers into simple actions.
          </Paragraph>

          <Row gutter={[24, 24]} justify="center" style={{ marginTop: 24 }}>
            <Col xs={24} md={10}>
              <Card
                bordered
                className="select-card"
                onClick={() => (window.location.href = "/login")} // wire as needed
              >
                <Title level={3} style={{ marginBottom: 8 }}>Individuals</Title>
                <Paragraph>Personalized lessons, goals & nudges.</Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={10}>
              <Card
                bordered
                className="select-card"
                onClick={() => (window.location.href = "/enterprise")}
              >
                <Title level={3} style={{ marginBottom: 8 }}>Enterprises</Title>
                <Paragraph>Analytics & curriculum for your team.</Paragraph>
              </Card>
            </Col>
          </Row>
        </section>

        {/* QUOTES / STATS STRIP */}
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
                <Title level={2} style={{ margin: 0 }}>+$140</Title>
                <Text type="secondary">avg. monthly savings after 3 actions</Text>
              </Card>
            </Col>
            <Col xs={24} md={7}>
              <Card className="strip-card" bordered={false}>
                <Paragraph>
                  “Finally understood APR and paid off my card faster.”
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </section>

        {/* BIG CTA */}
        <section className="cta">
          <Title>Start your plan in 2 minutes</Title>
          <Paragraph>Answer a few questions → get a simple action plan.</Paragraph>
          <Button size="large" type="primary" href="#signup">Get started</Button>
        </section>

        {/* CONTACT */}
        <section className="contact" id="contact">
          <Title level={3}>Contact Us</Title>
          <Paragraph>Email: hello@fined.app</Paragraph>
          <Divider />
        </section>
      </Content>

      {/* FOOTER */}
      <Footer style={{ textAlign: "center" }}>
        © {new Date().getFullYear()} FinEd • Privacy • Terms
      </Footer>

      {/* FLOATING CHAT BUTTON */}
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
