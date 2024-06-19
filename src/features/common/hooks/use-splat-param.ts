import { useParams } from 'react-router-dom'

export const useSplatParam = () => {
  const params = useParams()
  return params['*']
}
