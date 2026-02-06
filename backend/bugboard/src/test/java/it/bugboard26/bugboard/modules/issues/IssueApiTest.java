package it.bugboard26.bugboard.modules.issues;

import com.fasterxml.jackson.databind.ObjectMapper;
import it.bugboard26.bugboard.auth.AuthInterceptor;
import it.bugboard26.bugboard.entities.User;
import it.bugboard26.bugboard.enums.IssueState;
import it.bugboard26.bugboard.enums.IssueType;
import it.bugboard26.bugboard.enums.Priority;
import it.bugboard26.bugboard.modules.users.dtos.UserResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.jackson.autoconfigure.JacksonAutoConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import it.bugboard26.bugboard.auth.Jwt;
import it.bugboard26.bugboard.entities.Issue;
import it.bugboard26.bugboard.entities.Project;
import it.bugboard26.bugboard.enums.Role;
import it.bugboard26.bugboard.modules.issues.dtos.IssueRequest;
import it.bugboard26.bugboard.modules.issues.dtos.IssueResponse;
import it.bugboard26.bugboard.modules.projects.ProjectService;
import it.bugboard26.bugboard.modules.users.UserService;

@WebMvcTest(IssueApi.class)
class IssueApiTest {

    @Autowired
    private MockMvc mvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private AuthInterceptor authInterceptor;

    @MockitoBean
    private Jwt jwt;

    @MockitoBean
    private IssueService issueService;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private ProjectService projectService;

    String url = "/projects/{projectUuid}/issues";

    @BeforeEach
    void setup() throws Exception {
        when(authInterceptor.preHandle(any(), any(), any())).thenReturn(true);
    }


    /* --------- Tests per GET --------- */
    @Test
    void getIssuesByProject_InvalidProjectUUID() throws Exception {
        String invalidUUID = "invalid-uuid";

        mvc.perform(get(url, invalidUUID))
            .andExpect(status().isBadRequest());

        verifyNoInteractions(projectService);
        verifyNoInteractions(issueService);
    }

    @Test
    void getIssuesByProject_NotFoundProjectUUID() throws Exception {
        UUID projectUUID = UUID.randomUUID();

        when(projectService.getByUuid(projectUUID)).thenReturn(Optional.empty());

        mvc.perform(get(url, projectUUID))
                .andExpect(status().isNotFound());

        verify(projectService).getByUuid(projectUUID);
        verifyNoInteractions(issueService);
    }

    @Test
    void getIssuesByProject_InvalidType() throws Exception {
        UUID projectUUID = UUID.randomUUID();

        mvc.perform(get(url, projectUUID)
                        .param("type", "INVALID_TYPE")
                        .param("priority", "LOW"))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(projectService);
        verifyNoInteractions(issueService);
    }

    @Test
    void getIssuesByProject_InvalidPriority() throws Exception {
        UUID projectUUID = UUID.randomUUID();

        mvc.perform(get(url, projectUUID)
                        .param("type", "BUG")
                        .param("priority", "INVALID_PRIORITY"))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(projectService);
        verifyNoInteractions(issueService);
    }

    @Test
    void getIssuesByProject_InvalidState() throws Exception{
        UUID projectUUID = UUID.randomUUID();

        mvc.perform(get(url, projectUUID)
                        .param("type", "BUG")
                        .param("priority", "LOW")
                        .param("state", "INVALID_STATE"))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(projectService);
        verifyNoInteractions(issueService);
    }

    @Test
    void getIssuesByProject_TypeBug_PriorityLow_StatusTodo() throws Exception {
        // 1. ARRANGE
        UUID projectUuid = UUID.randomUUID();
        Project fakeProject = new Project();
        fakeProject.setUuid(projectUuid);

        Issue fakeEntity = new Issue();
        List<Issue> entityList = List.of(fakeEntity);
        List<IssueResponse> dtoList = List.of(new IssueResponse());

        when(projectService.getByUuid(projectUuid)).thenReturn(Optional.of(fakeProject));

        when(issueService.getIssuesByProject(
                eq(fakeProject),
                eq(IssueType.BUG),
                eq(Priority.LOW),
                eq(IssueState.TODO)
        )).thenReturn(entityList);

        when(issueService.enrichIssuesWithAuthors(entityList)).thenReturn(dtoList);

        // 2. ACT & ASSERT
        mvc.perform(get(url, projectUuid)
                        .param("type", "BUG")
                        .param("priority", "LOW")
                        .param("state", "TODO")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        // 3. VERIFY
        verify(projectService).getByUuid(projectUuid);
        verify(issueService).getIssuesByProject(
                eq(fakeProject),
                eq(IssueType.BUG),
                eq(Priority.LOW),
                eq(IssueState.TODO)
        );
        verify(issueService).enrichIssuesWithAuthors(entityList);
    }

    @Test
    void getIssuesByProject_TypeQuestion_PriorityMedium_StatusPending() throws Exception {
        // 1. ARRANGE
        UUID projectUuid = UUID.randomUUID();
        Project fakeProject = new Project();
        fakeProject.setUuid(projectUuid);

        List<Issue> entityList = List.of(new Issue());
        List<IssueResponse> dtoList = List.of(new IssueResponse());

        when(projectService.getByUuid(projectUuid)).thenReturn(Optional.of(fakeProject));

        when(issueService.getIssuesByProject(
                eq(fakeProject),
                eq(IssueType.QUESTION),
                eq(Priority.MEDIUM),
                eq(IssueState.PENDING)
        )).thenReturn(entityList);

        when(issueService.enrichIssuesWithAuthors(entityList)).thenReturn(dtoList);

        // 2. ACT & ASSERT
        mvc.perform(get(url, projectUuid)
                        .param("type", "QUESTION")
                        .param("priority", "MEDIUM")
                        .param("state", "PENDING")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));

        // 3. VERIFY
        verify(projectService).getByUuid(projectUuid);
        verify(issueService).getIssuesByProject(
                eq(fakeProject),
                eq(IssueType.QUESTION),
                eq(Priority.MEDIUM),
                eq(IssueState.PENDING)
        );
        verify(issueService).enrichIssuesWithAuthors(entityList);
    }

    @Test
    void getIssuesByProject_TypeFeature_PriorityHigh_StatusDone() throws Exception {
        // 1. ARRANGE
        UUID projectUuid = UUID.randomUUID();
        Project fakeProject = new Project();
        fakeProject.setUuid(projectUuid);

        List<Issue> entityList = List.of(new Issue());
        List<IssueResponse> dtoList = List.of(new IssueResponse());

        when(projectService.getByUuid(projectUuid)).thenReturn(Optional.of(fakeProject));

        when(issueService.getIssuesByProject(
                eq(fakeProject),
                eq(IssueType.FEATURE),
                eq(Priority.HIGH),
                eq(IssueState.DONE)
        )).thenReturn(entityList);

        when(issueService.enrichIssuesWithAuthors(entityList)).thenReturn(dtoList);

        // 2. ACT & ASSERT
        mvc.perform(get(url, projectUuid)
                        .param("type", "FEATURE")
                        .param("priority", "HIGH")
                        .param("state", "DONE")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));

        // 3. VERIFY
        verify(projectService).getByUuid(projectUuid);
        verify(issueService).getIssuesByProject(
                eq(fakeProject),
                eq(IssueType.FEATURE),
                eq(Priority.HIGH),
                eq(IssueState.DONE)
        );
        verify(issueService).enrichIssuesWithAuthors(entityList);
    }

    @Test
    void getIssuesByProject_TypeDocumentation_NoPriority_NoStatus() throws Exception {
        // 1. ARRANGE
        UUID projectUuid = UUID.randomUUID();
        Project fakeProject = new Project();
        fakeProject.setUuid(projectUuid);

        List<Issue> entityList = List.of(new Issue());
        List<IssueResponse> dtoList = List.of(new IssueResponse());

        when(projectService.getByUuid(projectUuid)).thenReturn(Optional.of(fakeProject));

        // Parametri mancanti -> ci aspettiamo null
        when(issueService.getIssuesByProject(
                eq(fakeProject),
                eq(IssueType.DOCUMENTATION),
                eq(null),
                eq(null)
        )).thenReturn(entityList);

        when(issueService.enrichIssuesWithAuthors(entityList)).thenReturn(dtoList);

        // 2. ACT & ASSERT
        mvc.perform(get(url, projectUuid)
                        .param("type", "DOCUMENTATION")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));

        // 3. VERIFY
        verify(projectService).getByUuid(projectUuid);
        verify(issueService).getIssuesByProject(
                eq(fakeProject),
                eq(IssueType.DOCUMENTATION),
                eq(null),
                eq(null)
        );
        verify(issueService).enrichIssuesWithAuthors(entityList);
    }

    @Test
    void getIssuesByProject_NoFilters() throws Exception {
        // 1. ARRANGE
        UUID projectUuid = UUID.randomUUID();
        Project fakeProject = new Project();
        fakeProject.setUuid(projectUuid);

        List<Issue> entityList = List.of(new Issue(), new Issue(), new Issue(), new Issue());
        List<IssueResponse> dtoList = List.of(new IssueResponse(), new IssueResponse(), new IssueResponse(), new IssueResponse());

        when(projectService.getByUuid(projectUuid)).thenReturn(Optional.of(fakeProject));

        when(issueService.getIssuesByProject(
                eq(fakeProject),
                eq(null),
                eq(null),
                eq(null)
        )).thenReturn(entityList);

        when(issueService.enrichIssuesWithAuthors(entityList)).thenReturn(dtoList);

        // 2. ACT & ASSERT
        mvc.perform(get(url, projectUuid)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(4)));

        // 3. VERIFY
        verify(projectService).getByUuid(projectUuid);
        verify(issueService).getIssuesByProject(
                eq(fakeProject),
                eq(null),
                eq(null),
                eq(null)
        );
        verify(issueService).enrichIssuesWithAuthors(entityList);
    }


    /* --------- Tests per POST --------- */
    @Test
    void postNewIssue_InvalidProjectUUID() throws Exception {
        String invalidUUID = "invalid-uuid";

        mvc.perform(get(url, invalidUUID))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(projectService);
        verifyNoInteractions(issueService);
    }

    @Test
    void postNewIssue_NotFoundProjectUUID() throws Exception {
        UUID projectUUID = UUID.randomUUID();

        when(projectService.getByUuid(projectUUID)).thenReturn(Optional.empty());

        mvc.perform(get(url, projectUUID))
                .andExpect(status().isNotFound());

        verify(projectService).getByUuid(projectUUID);
        verifyNoInteractions(issueService);
    }

    @Test
    void postNewIssue_InvalidIssueRequest() throws Exception {
        UUID projectUUID = UUID.randomUUID();

        mvc.perform(post(url, projectUUID))
            .andExpect(status().isBadRequest());

        verifyNoInteractions(userService);
        verifyNoInteractions(projectService);
        verifyNoInteractions(issueService);
    }

    @Test
    void postNewIssue_Success() throws Exception {
        // 1. ARRANGE
        UUID projectUuid = UUID.randomUUID();
        UUID userUuid = UUID.randomUUID();
        Project fakeProject = new Project();
        User fakeUser = new User();
        Issue fakeIssue = new Issue();
        fakeIssue.setUuid(UUID.randomUUID());

        when(jwt.getRole()).thenReturn(Role.ADMIN);
        when(jwt.getUserUuid()).thenReturn(userUuid);

        Claims fakeClaims = mock(Claims.class);
        when(fakeClaims.getSubject()).thenReturn(userUuid.toString());
        when(fakeClaims.get("name", String.class)).thenReturn("Mario");
        when(fakeClaims.get("surname", String.class)).thenReturn("Rossi");
        when(fakeClaims.get("email", String.class)).thenReturn("mario@example.com");
        when(fakeClaims.get("role", String.class)).thenReturn("ADMIN");

        Jws<Claims> fakeJws = (Jws<Claims>) mock(Jws.class);
        when(fakeJws.getPayload()).thenReturn(fakeClaims);
        when(jwt.getToken()).thenReturn(fakeJws);

        when(projectService.getByUuid(projectUuid)).thenReturn(Optional.of(fakeProject));
        when(userService.getByUuid(userUuid)).thenReturn(fakeUser);
        when(issueService.createIssue(any(IssueRequest.class), eq(fakeUser), eq(fakeProject))).thenReturn(fakeIssue);

        String jsonBody = """
    {
        "title": "Bug critico",
        "description": "Dettagli del bug",
        "type": "BUG",
        "priority": "HIGH"
    }
    """;

        // 2. ACT & ASSERT
        mvc.perform(post(url, projectUuid)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonBody))
                .andExpect(status().isCreated());

        // 3. VERIFY
        verify(jwt).getRole();
        verify(projectService).getByUuid(projectUuid);
        verify(jwt).getUserUuid();
        verify(userService).getByUuid(userUuid);
        verify(issueService).createIssue(any(IssueRequest.class), eq(fakeUser), eq(fakeProject));
        verify(jwt).getToken();
    }
}