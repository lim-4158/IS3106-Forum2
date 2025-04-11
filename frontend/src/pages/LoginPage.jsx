import AuthForm from '../components/auth/AuthForm';
import LoginForm from '../components/auth/LoginForm';
import { Helmet } from 'react-helmet';

const LoginPage = () => {
  return (
    <>
      <Helmet>
        <title>Login | Forum</title>
      </Helmet>
      <AuthForm 
        title="Sign in to Forum" 
        subtitle="Welcome back! Please enter your details to continue"
      >
        <LoginForm />
      </AuthForm>
    </>
  );
};

export default LoginPage; 