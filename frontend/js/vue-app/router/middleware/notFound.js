export default function ({ to, next }) {
  if (!to.matched.length) {
    next({ name: 'not-found' })
    return
  }

  next()
}
