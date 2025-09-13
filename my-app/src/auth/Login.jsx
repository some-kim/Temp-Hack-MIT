import { Card, Form, Input, Button, message } from "antd";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "./supabaseClient";

export default function Login(){
  const nav = useNavigate();

  const onFinish = async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return message.error(error.message);
    message.success("Welcome back!");
    nav("/onboarding"); // later: route by role to /app/individual or /app/corporate a little scared 
  };

  return (
    <Card title="Log in" style={{ maxWidth: 440, margin: "64px auto" }}>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item name="email" label="Email" rules={[{ required:true, type:"email" }]}><Input/></Form.Item>
        <Form.Item name="password" label="Password" rules={[{ required:true }]}><Input.Password/></Form.Item>
        <Button type="primary" htmlType="submit" block>Log in</Button>
      </Form>
      <div style={{ marginTop: 12 }}>
        <Link to="/signup">Create an account</Link>
      </div>
    </Card>
  );
}
