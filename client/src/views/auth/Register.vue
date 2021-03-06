<template>
  <div class="register" @keyup.enter="register">
    <h2 class="register__label">
      <span>Hello,</span><br />
      Sign Up!
    </h2>
    <form class="register__form" @submit.prevent="register">
      <Input
        name="Nazwa użytkownika"
        v-model="registerData.name"
        placeholder="Wiesia123"
        class="register__input register__input__name"
      />
      <Input
        type="email"
        name="Adres email"
        v-model="registerData.email"
        placeholder="email@email.com"
        class="register__input register__input__email"
      />
      <Password
        v-model="registerData.password"
        class="register__input register__input__password"
      />
      <div class="error repeated-password-error" v-if="error">{{ error }}</div>
      <Button text="Rejestracja" />
    </form>
    <LoadingModal v-if="loading" />
    <Modal
      @modal-accepted="registerSuccess && $router.push({ path: '/auth/login' })"
    />
  </div>
</template>

<script lang="ts">
import gsap from "gsap";
import Button from "../../components/inputs/Button.vue";
import Input from "../../components/inputs/Input.vue";
import Password from "../../components/inputs/PasswordInput.vue";
import Modal from "../../components/modals/MainModal.vue";
import { reactive, ref, onMounted, defineComponent } from "vue";
import { useStore } from "vuex";
import LoadingModal from "../../components/modals/LoadingModal.vue";
export default defineComponent({
  components: {
    Button,
    Input,
    Password,
    Modal,
    LoadingModal
  },
  setup() {
    const registerData = reactive({
      name: "",
      password: "",
      email: ""
    });
    const registerSuccess = ref(false);
    const store = useStore();

    const error = ref("");
    const loading = ref(false);

    async function register() {
      const errors = document.querySelectorAll(".error");
      if (
        !errors.length &&
        Object.values(registerData).filter(i => i !== "").length >= 3
      ) {
        loading.value = true;

        //Fetch
        await store.dispatch("register", registerData);
        loading.value = false;

        //Reset fields
        registerData.name = "";
        registerData.password = "";
        registerData.email = "";

        //Modal
        if (!store.state.error) {
          registerSuccess.value = true;
          store.dispatch("setModal", {
            show: true,
            error: false,
            message: "Twoje konto zostało utworzone, sprawdź email!"
          });
        } else {
          registerSuccess.value = false;
          store.dispatch("setModal", {
            show: true,
            error: true,
            message: store.state.error
          });
        }
      }
    }

    onMounted(() => {
      const tl = gsap.timeline({});

      if (window.innerWidth < 1000) {
        tl.from(".register__label", {
          duration: 0.7,
          opacity: 0
        })
          .addLabel("form")
          .fromTo(
            ".register__form",
            {
              duration: 0.5,
              opacity: 0,
              y: 200,
              ease: "ease-in"
            },
            {
              opacity: 1,
              y: -90
            }
          )
          .to(
            ".register__label",
            {
              duration: 0.5,
              y: -105
            },
            "form"
          );
      } else {
        tl.fromTo(
          ".register__label",
          {
            duration: 0.5,
            x: -150,
            y: -70,
            opacity: 0
          },
          {
            y: -70,
            opacity: 1,
            x: 0
          }
        ).fromTo(
          ".register__form",
          {
            duration: 0.5,
            opacity: 0,
            y: 100
          },
          {
            opacity: 1,
            y: -50,
            ease: "ease-in"
          }
        );
      }
    });

    return {
      registerData,
      registerSuccess,
      register,
      error,
      loading
    };
  }
});
</script>

<style lang="scss" scoped>
.register {
  min-height: 100vh;
  min-width: 100vw;
  @include flex;
  flex-flow: column wrap;
  background: transparent;
  padding-top: 40px;

  &__label {
    font-size: 3rem;
    padding: 0 30px;
    color: #000;
    text-align: center;
    span {
      font-size: 2rem;
    }
  }

  &__form {
    width: 100%;
    @include flex;
    flex-flow: column wrap;

    button {
      margin-top: 40px;
    }
  }
}

@media all and (min-width: 1000px) {
  .register {
    flex-flow: row nowrap;

    &__label {
      font-size: 3.7rem;
      margin-right: 40px;

      span {
        font-size: 2.7rem;
      }
    }

    &__form {
      max-width: 35%;
    }
  }
}
</style>
