// src/individual/landing_firsttime_account.jsx
import { useEffect, useState } from "react";
import {
  Layout,
  Card,
  Typography,
  Button,
  Row,
  Col,
  Skeleton,
  message,
  Result,
  Divider,
  Statistic,
} from "antd";
import { useNavigate } from "react-router-dom";
import { supabase } from "../auth/supabaseClient";

const { Header, Content } = Layout;
const { Title, Paragraph, Text } = Typography;

export default function LandingFirstTimeAccount() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState(null); // auth uuid

  const [profile, setProfile] = useState(null); // Users row
  const [income, setIncome] = useState(null);
  const [savings, setSavings] = useState(null);
  const [spending, setSpending] = useState(null);

  useEffect(() => {
    (async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) message.error(error.message);
      if (!user) return nav("/login", { replace: true });
      setUid(user.id);

      // Get Users row by auth_uid (uuid)
      const { data: userRow, error: uErr } = await supabase
        .from("Users")
        .select("id, name, email, occupation, financial_goals")
        .eq("auth_uid", user.id)
        .maybeSingle();

      if (uErr) message.error(uErr.message);

      setProfile(userRow || null);

      const accountId = userRow?.id ?? -1;

      // Load latest Income/Savings/Spending rows by user_id (int8)
      const [{ data: inc }, { data: sav }, { data: spd }] = await Promise.all([
        supabase
          .from("Income")
          .select("*")
          .eq("user_id", accountId)
          .order("id", { ascending: false })
          .limit(1),
        supabase
          .from("Savings")
          .select("*")
          .eq("user_id", accountId)
          .order("id", { ascending: false })
          .limit(1),
        supabase
          .from("Spending")
          .select("*")
          .eq("user_id", accountId)
          .order("id", { ascending: false })
          .limit(1),
      ]);

      setIncome(inc?.[0] || null);
      setSavings(sav?.[0] || null);
      setSpending(spd?.[0] || null);

      setLoading(false);
    })();
  }, [nav]);

  const monthlyIncome =
    income?.annual_income != null ? Number(income.annual_income) / 12 : null;

  const monthlyCoreSpend =
    (spending?.rent_utilities ?? 0) + (spending?.debt_payment ?? 0);

  const monthlyFood = (spending?.groceries_food ?? 0) * 4.0;
  const monthlyOthers = (spending?.others ?? 0) * 4.0;

  const monthlyTotalSpend = monthlyCoreSpend + monthlyFood + monthlyOthers;
  const estMonthlyLeft =
    monthlyIncome != null ? monthlyIncome - monthlyTotalSpend : null;

  if (loading) {
    return (
      <div style={{ maxWidth: 960, margin: "40px auto" }}>
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );
  }

  if (!uid) {
    return (
      <Result
        status="warning"
        title="Please log in to see your account"
        extra={
          <Button type="primary" onClick={() => nav("/login")}>
            Log in
          </Button>
        }
      />
    );
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ background: "#001529" }}>
        <Title level={3} style={{ color: "#fff", margin: 0 }}>
          Welcome{profile?.name ? `, ${profile.name}` : ""} 👋
        </Title>
      </Header>

      <Content style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Card bordered>
              <Title level={4} style={{ marginBottom: 4 }}>
                Your starter snapshot
              </Title>
              <Paragraph type="secondary" style={{ marginTop: 0 }}>
                We pulled this from your survey. You can tweak anything later.
              </Paragraph>
              <Divider style={{ margin: "12px 0" }} />

              <Row gutter={[16, 16]}>
                <Col xs={24} md={6}>
                  <Card>
                    <Statistic
                      title="Monthly Income (est.)"
                      value={
                        monthlyIncome != null ? Math.round(monthlyIncome) : "—"
                      }
                      prefix="$"
                    />
                  </Card>
                </Col>
                <Col xs={24} md={6}>
                  <Card>
                    <Statistic
                      title="Monthly Spending (est.)"
                      value={Math.round(monthlyTotalSpend)}
                      prefix="$"
                    />
                  </Card>
                </Col>
                <Col xs={24} md={6}>
                  <Card>
                    <Statistic
                      title="Leftover (est.)"
                      value={
                        estMonthlyLeft != null ? Math.round(estMonthlyLeft) : "—"
                      }
                      prefix="$"
                      valueStyle={{
                        color: estMonthlyLeft >= 0 ? "#52c41a" : "#cf1322",
                      }}
                    />
                  </Card>
                </Col>
                <Col xs={24} md={6}>
                  <Card>
                    <Statistic
                      title="Savings Balance"
                      value={
                        savings?.current_amount != null
                          ? Math.round(savings.current_amount)
                          : 0
                      }
                      prefix="$"
                    />
                  </Card>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card title="Profile" bordered>
              <Paragraph>
                <Text strong>Name:</Text> {profile?.name || "—"}
              </Paragraph>
              <Paragraph>
                <Text strong>Email:</Text> {profile?.email || "—"}
              </Paragraph>
              <Paragraph>
                <Text strong>Occupation:</Text> {profile?.occupation || "—"}
              </Paragraph>
              <Paragraph style={{ marginBottom: 0 }}>
                <Text strong>Goals:</Text> {profile?.financial_goals || "—"}
              </Paragraph>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card title="Quick actions" bordered>
              <Row gutter={[8, 8]}>
                <Col span={24}>
                  <Button
                    type="primary"
                    block
                    onClick={() => nav("/app/individual/dashboard")}
                  >
                    Go to your dashboard
                  </Button>
                </Col>
                <Col span={24}>
                  <Button block onClick={() => nav("/app/individual/goals")}>
                    Set a savings goal
                  </Button>
                </Col>
                <Col span={24}>
                  <Button block onClick={() => nav("/app/individual/spending")}>
                    Review spending inputs
                  </Button>
                </Col>
                <Col span={24}>
                  <Button block onClick={() => nav("/app/individual/lessons")}>
                    Start first lesson
                  </Button>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}
