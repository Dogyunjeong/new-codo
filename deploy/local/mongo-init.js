db.createUser({
  user: "dev-admin",
  pwd: "secretSecret",
  roles: [
    {
      role: "readWrite",
      db: "woojoolearn",
    },
  ],
});
