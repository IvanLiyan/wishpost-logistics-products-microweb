<template>
  <v-card class="login-con">
    <v-card-title>{{ user == null ? 'Login' : 'User Info' }}</v-card-title>
    <v-card-text v-if="user == null">
      <v-text-field v-model="userName" label="User Name"></v-text-field>
      <v-text-field v-model="password" label="Password" type="password"></v-text-field>
      <v-btn @click="login">login</v-btn>
    </v-card-text>
    <v-card-text v-else>
      {{ user }}
    </v-card-text>
  </v-card>
</template>
<script>
import req from '@utils/request';
export default {
  data: () => {
    return {
      user: null,
      userName: '',
      password: '',
    };
  },
  methods: {
    async getUserInfo() {
      const { data } = await req('/api/get-user');
      if (data.user) {
        this.$store.state.user = data.user;
        this.$router.push('/');
      }
    },
    async login() {
      try {
        await req('/api/login', {
          password: this.password,
          username: this.userName,
          skip_token: true,
        });
        this.getUserInfo();
      } catch (error) {
        this.$wt.notify({
          type: 'error',
          message: error.message,
        });
      }
    },
  },
};
</script>
<style>
.login-con {
  width: 60%;
  margin-left: auto;
  margin-right: auto;
  margin-top: 80px;
}
</style>
