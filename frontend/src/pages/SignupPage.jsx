import AuthForm from '../components/auth/AuthForm';
import SignupForm from '../components/auth/SignupForm';
import { Helmet } from 'react-helmet';

const SignupPage = () => {
  return (
    <>
      <Helmet>
        <title>Create Account | Forum</title>
      </Helmet>
      <AuthForm 
        title="Create an Account" 
        subtitle="Join our community to ask questions and share knowledge"
      >
        <SignupForm />
      </AuthForm>
    </>
  );
};

export default SignupPage; 