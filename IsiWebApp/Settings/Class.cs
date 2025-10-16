namespace IsiWebApp.Settings
{
    public class KnimePathSettings
    {
        public string Exe { get; set; } = string.Empty;
        public string Workflow { get; set; } = string.Empty;
        public string UploadFolder { get; set; } = string.Empty;

        private string GetAbsolutePath(string relativePath)
        {
            if (Path.IsPathRooted(relativePath))
                return relativePath;

            var baseDir = AppContext.BaseDirectory;
            return Path.GetFullPath(Path.Combine(baseDir, relativePath));
        }

        public string ExeFullPath => GetAbsolutePath(Exe);
        public string WorkflowFullPath => GetAbsolutePath(Workflow);
        public string UploadFullPath => GetAbsolutePath(UploadFolder);
    }
}