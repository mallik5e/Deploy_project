import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import {toast} from 'react-toastify'
import {useNavigate} from 'react-router-dom'

const Login = () => {
  const navigate = useNavigate()
  const [state,setState] = useState('Sign Up')
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [name,setName] = useState('')
  
  const backendUrl = "http://localhost:5000"
  
  const token = localStorage.getItem('token')

  const onSubmitHandler = async(e) => {
       e.preventDefault();
       try{
        if(state === 'Sign Up'){
          const {data} = await axios.post(backendUrl+'/api/admin/register',{name,password,email})
          if(data.success){
            toast.success('sign up success')
            localStorage.setItem('token',data.token)
            navigate('/dashboard')
          
          }else{
            toast.error(data.message)
          }
        }else{
          const {data} = await axios.post(backendUrl+'/api/admin/login',{password,email})
          if(data.success){
            toast.success('Login success')
            localStorage.setItem('token',data.token)
            navigate('/dashboard')
          }else{
            toast.error(data.message)
          }
        }
       }catch(error){
        console.log(error)
        toast.error(error.message)
       }
  }

  useEffect(()=>{
    if(token){
       navigate('/')
    }
  },[token])

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[85vh] flex items-center'>
   <div className='flex flex-col bg-white/20 backdrop-blur-sm gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 text-zinc-600 rounded-xl text-sm shadow-2xl'>
        <p className='text-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500  bg-clip-text text-transparent font-bold'>{state === 'Sign Up' ? "Create Account" : "Login Account"}</p>
        <p className='font-bold mb-2'>Please {state === 'Sign Up' ? 'Sign Up' : 'Login'} here... </p>
        {
          state === 'Sign Up' &&   <div className='w-full'>
          <p className='font-semibold'>Full Name</p>
          <input className='border border-zinc-500 rounded w-full p-2 mt-1' type="text" onChange={(e)=>setName(e.target.value)} value={name} placeholder='Enter your name' />
        </div>
        }
        <div className='w-full'>
          <p className='font-semibold'>Email</p>
          <input className='border border-zinc-500 rounded w-full p-2 mt-1' type="email" onChange={(e)=>setEmail(e.target.value)} value={email} placeholder='Enter your email' />
        </div>
        <div className='w-full'>
          <p className='font-semibold'>Password</p>
          <input className='border border-zinc-500  rounded w-full p-2 mt-1' type="password" onChange={(e)=>setPassword(e.target.value)} value={password} placeholder='Enter your password' />
        </div>
        <button type='submit' className='bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white w-full py-2 rounded-md text-base font-semibold'>{state === 'Sign Up' ? "Create Account" : "Login"}</button>
       {
        state === 'Sign Up'
        ? <p className='font-semibold'>Already have an account?<span onClick={()=>setState('Login')} className='text-blue-500 underline cursor-pointer'>Login here</span></p>
        : <p className='font-semibold'>Create an new account? <span onClick={()=>setState('Sign Up')} className='text-blue-500 underline cursor-pointer'>Click here</span></p>
       }
      </div>
    </form>
  )
}

export default Login